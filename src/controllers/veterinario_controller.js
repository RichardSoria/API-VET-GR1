import Veterinario from "../models/Veterinario.js"
import {sendMailToUser, sendMailToRecoveryPassword} from "../config/nodemailer.js"
import generarJWT from "../helpers/crearJWT.js"
import mongoose from "mongoose"

const registro = async(req, res) => {
    // Paso 1 - Tomar datos del request
    const {email,password} = req.body

    // Paso 2 - Validar los datos
    if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const verificarEmailBDD = await Veterinario.findOne({email})
    
    if (verificarEmailBDD) return res.status(400).json({msg: 'Lo sentimos, el email ya se encuentra registrado.'})
    
    // Paso 3 - Interactuar BDD  
    const nuevoVeterinario = new Veterinario(req.body)
    nuevoVeterinario.password = await nuevoVeterinario.encryptPassword(password)
    
    const token = nuevoVeterinario.crearToken()
    await sendMailToUser(email,token)
    await nuevoVeterinario.save()
    res.status(200).json({msg:'Revisa tu correo electrónico para confirmar tu cuenta.'})
}

const confirmEmail = async(req, res) => {
    const {token} = req.params

    if (!(token)) return res.status(400).json({msg: 'Lo sentimos, no se ha podido confirmar tu cuenta.'})
    const VeterinarioBDD = await Veterinario.findOne({token: req.params.token})
    if (!VeterinarioBDD?.token) return res.status(400).json({msg: 'Token confirmado, ya puedes iniciar sesión.'})
    VeterinarioBDD.token = null
    VeterinarioBDD.confirmEmail=true
    await VeterinarioBDD.save()
    res.status(200).json({msg: 'Token confirmado, ya puedes iniciar sesión.'})
}

const login = async(req, res) => {
    // Paso 1 - Tomar datos del request
    const {email,password} = req.body

    // Paso 2 - Validar los datos
    if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})
    
    const veterinarioBDD = await Veterinario.findOne({email}).select("-status -createdAt -updatedAt -__v")
    if (veterinarioBDD?.confirmEmail===false) return res.status(400).json({msg: 'Lo sentimos, debes validar tu cuenta.'})

    if (!veterinarioBDD) return res.status(400).json({msg: 'Lo sentimos, el email no se encuentra registrado.'})
    const matchPassword = await veterinarioBDD.matchPassword(password)

    if (!matchPassword) return res.status(400).json({msg: 'Lo sentimos, la contraseña es incorrecta.'})
    
    // Paso 3 - Interactuar BDD
    const {nombre,apellido,direccion,telefono,_id} = veterinarioBDD

    const tokenJWT = generarJWT(veterinarioBDD._id,"Veterinario")
    res.status(200).json({
        nombre,
        apellido,
        direccion,
        telefono,
        email:veterinarioBDD.email,
        _id,tokenJWT})
}

const recuperarPassword = async(req,res) => {
    // Paso 1 - Tomar datos del request
    const {email} = req.body

    // Paso 2 - Validar los datos
    if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})
    
    const VeterinarioBDD = await Veterinario.findOne({email})
    if (!VeterinarioBDD) return res.status(400).json({msg: 'Lo sentimos, el email no se encuentra registrado.'})

    // Paso 3 - Interactuar BDD
    const token = VeterinarioBDD.crearToken()
    VeterinarioBDD.token = token
    await VeterinarioBDD.save()
    await sendMailToRecoveryPassword(email,token)
    res.status(200).json({msg:'Revisa tu correo electrónico para recuperar tu contraseña.'})
}

const comprobarTokenPassword = async(req,res) => {
    // Paso 1 - Tomar datos del request
    const {token} = req.params
    
    // Paso 2 - Validar los datos
    if (!token) return res.status(400).json({msg: 'Lo sentimos, no se ha podido confirmar tu cuenta.'})
    const VeterinarioBDD = await Veterinario.findOne({token: req.params.token})
    if (VeterinarioBDD?.token !== token) return res.status(400).json({msg: 'Lo sentimos, no se ha podido confirmar tu cuenta.'})
    

    // Paso 3 - Interactuar BDD
    await VeterinarioBDD.save()
    res.status(200).json({msg: 'Token confirmado, ya puedes reestablecer tu contraseña.'})
}

const nuevoPassword = async(req,res) => {
    // Paso 1 - Tomar datos del request
    const {password, confirmPassword} = req.body

    // Paso 2 - Validar los datos
    if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})
    
    if (password != confirmPassword) return res.status(400).json({msg: 'Lo sentimos, las contraseñas no coinciden.'})
    
    const VeterinarioBDD = await Veterinario.findOne({token: req.params.token})
    if (!VeterinarioBDD?.token) return res.status(400).json({msg: 'Lo sentimos, no se ha podido confirmar tu cuenta.'})
   
    // Paso 3 - Interactuar BDD
    VeterinarioBDD.token = null
    VeterinarioBDD.password = await VeterinarioBDD.encryptPassword(password)
    VeterinarioBDD.token = null
    await VeterinarioBDD.save()
    res.status(200).json({msg: 'Contraseña reestablecida, ya puedes iniciar sesión.'})
}

const perfil =(req,res)=>{
    delete req.veterinarioBDD.token
    delete req.veterinarioBDD.confirmEmail
    delete req.veterinarioBDD.createdAt
    delete req.veterinarioBDD.updatedAt
    delete req.veterinarioBDD.__v
    res.status(200).json(req.veterinarioBDD)
}

const actualizarPerfil = async (req,res)=>{
    const {id} = req.params
    if( !mongoose.Types.ObjectId.isValid(id) ) return res.status(404).json({msg:`Lo sentimos, debe ser un id válido`});
    if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const veterinarioBDD = await Veterinario.findById(id)
    if(!veterinarioBDD) return res.status(404).json({msg:`Lo sentimos, no existe el veterinario ${id}`})
    if (veterinarioBDD.email !=  req.body.email)
    {
        const veterinarioBDDMail = await Veterinario.findOne({email:req.body.email})
        if (veterinarioBDDMail)
        {
            return res.status(404).json({msg:`Lo sentimos, el existe ya se encuentra registrado`})  
        }
    }
	veterinarioBDD.nombre = req.body.nombre || veterinarioBDD?.nombre
    veterinarioBDD.apellido = req.body.apellido  || veterinarioBDD?.apellido
    veterinarioBDD.direccion = req.body.direccion ||  veterinarioBDD?.direccion
    veterinarioBDD.telefono = req.body.telefono || veterinarioBDD?.telefono
    veterinarioBDD.email = req.body.email || veterinarioBDD?.email
    await veterinarioBDD.save()
    res.status(200).json({msg:"Perfil actualizado correctamente"})
}

const actualizarPassword = async (req,res)=>{
    const veterinarioBDD = await Veterinario.findById(req.veterinarioBDD._id)
    if(!veterinarioBDD) return res.status(404).json({msg:`Lo sentimos, no existe el veterinario ${id}`})
    const verificarPassword = await veterinarioBDD.matchPassword(req.body.passwordactual)
    if(!verificarPassword) return res.status(404).json({msg:"Lo sentimos, el password actual no es el correcto"})
    veterinarioBDD.password = await veterinarioBDD.encryptPassword(req.body.passwordnuevo)
    await veterinarioBDD.save()
    res.status(200).json({msg:"Password actualizado correctamente"})
}

export {
    registro,
    confirmEmail,
    login,
    recuperarPassword,
    comprobarTokenPassword,
    nuevoPassword,
    perfil,
    actualizarPerfil,
    actualizarPassword
}