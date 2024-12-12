import { Router } from "express"
import { registro,confirmEmail,login, recuperarPassword, comprobarTokenPassword, nuevoPassword, perfil, actualizarPerfil, actualizarPassword } from "../controllers/veterinario_controller.js"
import {verificarAutenticacion} from "../helpers/crearJWT.js"
const router = Router()

router.post('/registro',registro)
router.get("/confirmar/:token", confirmEmail);
router.post('/login',login)
router.post('/recuperar-password',recuperarPassword)
router.get('/recuperar-password/:token',comprobarTokenPassword)
router.post('/recuperar-password/:token',nuevoPassword)

// Rutas privadas
router.get('/veterinario',verificarAutenticacion,perfil)
router.put('/veterinario/:id',verificarAutenticacion,actualizarPerfil)
router.put('/veterinario/actualizar-password',verificarAutenticacion,actualizarPassword)

export default router