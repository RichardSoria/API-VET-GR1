import Veterinario from "../models/Veterinario.js"
import sendMailToUser from "../config/nodemailer.js"

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
    
    const veterinarioBDD = await Veterinario.findOne({email})
    if (veterinarioBDD?.confirmEmail===false) return res.status(400).json({msg: 'Lo sentimos, debes validar tu cuenta.'})

    if (!veterinarioBDD) return res.status(400).json({msg: 'Lo sentimos, el email no se encuentra registrado.'})
    const matchPassword = await veterinarioBDD.matchPassword(password)

    if (!matchPassword) return res.status(400).json({msg: 'Lo sentimos, la contraseña es incorrecta.'})
    
    // Paso 3 - Interactuar BDD
    res.status(200).json({veterinarioBDD})
}

export {
    registro,
    confirmEmail,
    login
}