import { Router } from "express"
import { registro,confirmEmail,login, recuperarPassword, comprobarTokenPassword, nuevoPassword, perfil, actualizarPerfil, actualizarPassword } from "../controllers/veterinario_controller.js"
import verificarAutenticacion from "../middlewares/autenticacion.js"
const router = Router()

// Rutas Veterinario

// Rutas públicas
router.post('/registro',registro)
router.get("/confirmar/:token", confirmEmail);
router.post('/login',login)
router.post('/recuperar-password',recuperarPassword)
router.get('/recuperar-password/:token',comprobarTokenPassword)
router.post('/recuperar-password/:token',nuevoPassword)

// Rutas privadas
router.get('/veterinario',verificarAutenticacion,perfil)
router.put('/veterinario/actualizar-password',verificarAutenticacion,actualizarPassword)
router.put('/veterinario/:id',verificarAutenticacion,actualizarPerfil)

export default router