import { Router } from "express"
import { registroPaciente, listarPacientes, detallePaciente, actualizarPaciente, eliminarPaciente, loginPaciente, perfilPaciente } from "../controllers/paciente_controller.js"
import verificarAutenticacion from "../middlewares/autenticacion.js"
const router = Router()

// Rutas Pacientes

// Mascota
router.post('/paciente/registro',verificarAutenticacion,registroPaciente)
router.get('/paciente',verificarAutenticacion,listarPacientes)
router.get('/paciente/:id',verificarAutenticacion,detallePaciente)
router.put('/paciente/:id',verificarAutenticacion,actualizarPaciente)
router.delete('/paciente/:id',verificarAutenticacion,eliminarPaciente)

// Dueño
router.post('/paciente/login',loginPaciente)
router.get('/paciente/perfil',verificarAutenticacion,perfilPaciente)

export default router