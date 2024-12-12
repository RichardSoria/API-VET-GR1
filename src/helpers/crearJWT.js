import jwt from 'jsonwebtoken';
import Veterinario from '../models/Veterinario.js';

const generarJWT = (id,rol) => {

    return jwt.sign({id,rol},process.env.JWT_SECRET,{expiresIn: '1h'});
}

// Método para verificar el TOKEN
const verificarAutenticacion = async(req,res,next) => {
    // VERIFICA QUE EXISTA EL TOKEN
    // Beaber
    
    if (!req.headers.authorization) return res.status(404).json({msg: 'Lo sentimos, se debe proporcionar un token.'})
        const {authorization} = req.headers
    
    try{
        const {id,rol} = jwt.verify(authorization.split(' ')[1],process.env.JWT_SECRET)
        if (rol === 'Veterinario'){
                req.VeterinarioBDD = await Veterinario.findById(id).lean().select('-password')
                next()
            }
        else{
            req.pacienteBDD = await Paciente.findById(id).lean().select('-password')
        }
        }catch (error){
            const e = new Error('Formato del token no válido')
            return res.status(400).json({msg: e.message})
        }
}


export {generarJWT,verificarAutenticacion}
