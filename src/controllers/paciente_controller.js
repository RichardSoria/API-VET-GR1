import Paciente from '../models/Paciente.js'
import {sendMailToPaciente} from '../config/nodemailer.js'
import generarJWT from "../helpers/crearJWT.js"
import mongoose from 'mongoose'

const registroPaciente = async(req,res) => {
    // 1.- Tomar datos del request
    const {email} = req.body

    // 2.- Validar los datos
    if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const verificarEmailBDD = await Paciente.findOne({email})
    if (verificarEmailBDD) return res.status(400).json({msg: 'Lo sentimos, el email ya se encuentra registrado.'})
    
    // 3.- Interactuar BDD
    const nuevoPaciente = new Paciente(req.body)
    nuevoPaciente.veterinario = req.veterinarioBDD._id
    const password = Math.random().toString(36).slice(2)
    nuevoPaciente.password = await nuevoPaciente.encryptPassword('vet'+password)
    await sendMailToPaciente(email,'vet'+password)
    await nuevoPaciente.save()
    res.status(200).json({msg: 'Paciente registrado correctamente.'})
}

const listarPacientes = async(req,res) => {
    // 1.- Interactuar BDD
    const pacientes = await Paciente.find({estado:true}).where('veterinario').equals(req.veterinarioBDD).select("-salida -createdAt -updatedAt -__v").populate('veterinario','_id nombre apellido')
    res.status(200).json(pacientes)
}

const detallePaciente = async(req,res)=>{
    // 1.- Tomar datos del request
    const {id} = req.params

    // 2.- Validar los datos
    if( !mongoose.Types.ObjectId.isValid(id) ) return res.status(404).json({msg:`Lo sentimos, no existe el veterinario ${id}`});
    
    // 3.- Interactuar BDD
    const paciente = await Paciente.findById(id).select("-createdAt -updatedAt -__v").populate('veterinario','_id nombre apellido')
    res.status(200).json(paciente)
}

const actualizarPaciente = async(req,res)=>{
    // 1.- Tomar datos del request
    const {id} = req.params

    // 2.- Validar los datos
    if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})
    if( !mongoose.Types.ObjectId.isValid(id) ) return res.status(404).json({msg:`Lo sentimos, no existe el veterinario ${id}`});
    
    //  3.- Interactuar BDD
    await Paciente.findByIdAndUpdate(req.params.id,req.body)
    res.status(200).json({msg:"Actualización exitosa del paciente"})
}

const eliminarPaciente = async (req,res)=>{
    // 1.- Tomar datos del request
    const {id} = req.params

    // 2.- Validar los datos
    if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})
    if( !mongoose.Types.ObjectId.isValid(id) ) return res.status(404).json({msg:`Lo sentimos, no existe el veterinario ${id}`})
    const {salida} = req.body

    // 3.- Interactuar BDD
    await Paciente.findByIdAndUpdate(req.params.id,{salida:Date.parse(salida),estado:false})
    res.status(200).json({msg:"Fecha de salida del paciente registrado exitosamente"})
}

const loginPaciente = async(req,res)=>{
    // 1.- Tomar datos del request
    const {email,password} = req.body

    // 2.- Validar los datos
    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const pacienteBDD = await Paciente.findOne({email})
    if(!pacienteBDD) return res.status(404).json({msg:"Lo sentimos, el usuario no se encuentra registrado"})
    const verificarPassword = await pacienteBDD.matchPassword(password)
    if(!verificarPassword) return res.status(404).json({msg:"Lo sentimos, el password no es el correcto"})
    
    // 3.- Interactuar BDD
    const token = generarJWT(pacienteBDD._id,"paciente")
	const {nombre,propietario,email:emailP,celular,convencional,_id} = pacienteBDD
    res.status(200).json({
        token,
        nombre,
        propietario,
        emailP,
        celular,
        convencional,
        _id
    })
}

const perfilPaciente = (req,res)=>{
    delete req.pacienteBDD.ingreso
    delete req.pacienteBDD.sintomas
    delete req.pacienteBDD.salida
    delete req.pacienteBDD.estado
    delete req.pacienteBDD.veterinario
    delete req.pacienteBDD.createdAt
    delete req.pacienteBDD.updatedAt
    delete req.pacienteBDD.__v
    res.status(200).json(req.pacienteBDD)
}

export { registroPaciente, listarPacientes, detallePaciente, actualizarPaciente, eliminarPaciente, loginPaciente, perfilPaciente }