import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import QRCode from "qrcode";
import { z } from "zod";
const HOURLY_RATE_CRC = 12000;
const crcFormatter = new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    maximumFractionDigits: 0,
});
const server = new McpServer({
    name: "qr-project-estimator",
    version: "1.0.0",
});
function inferProjectType(description) {
    const text = description.toLowerCase();
    if (text.includes("ecommerce") || text.includes("tienda") || text.includes("carrito") || text.includes("pago"))
        return "ecommerce";
    if (text.includes("app") || text.includes("móvil") || text.includes("movil") || text.includes("android") || text.includes("ios"))
        return "app";
    if (text.includes("sistema") || text.includes("dashboard") || text.includes("inventario") || text.includes("crm") || text.includes("reservas"))
        return "sistema";
    if (text.includes("landing") || text.includes("publicidad") || text.includes("promocional"))
        return "landing";
    return "web";
}
function getComplexityMultiplier(complexity) {
    if (complexity === "baja")
        return 0.85;
    if (complexity === "alta")
        return 1.45;
    return 1;
}
function buildScreens(projectType, includeQr) {
    const base = [
        { nombre: "Inicio", descripcion: "Presentación del negocio, propuesta de valor, servicios principales y llamados a la acción." },
        { nombre: "Detalle del servicio/producto", descripcion: "Información ampliada, beneficios, imágenes, precios de referencia y CTA." },
        { nombre: "Formulario de contacto", descripcion: "Captura de datos del cliente potencial y envío de solicitud." },
        { nombre: "Panel administrativo", descripcion: "Gestión básica de contenido, solicitudes y configuración general." }
    ];
    const extras = {
        landing: [
            { nombre: "Sección promocional", descripcion: "Oferta, beneficios, testimonios y contacto rápido." }
        ],
        web: [
            { nombre: "Nosotros", descripcion: "Historia, misión, equipo y credibilidad del negocio." },
            { nombre: "Servicios", descripcion: "Catálogo informativo de servicios ofrecidos." }
        ],
        ecommerce: [
            { nombre: "Catálogo", descripcion: "Listado filtrable de productos o servicios." },
            { nombre: "Carrito", descripcion: "Resumen de compra, cantidades y subtotal." },
            { nombre: "Checkout", descripcion: "Datos del cliente, método de pago y confirmación." },
            { nombre: "Órdenes", descripcion: "Consulta del estado de pedidos desde administración." }
        ],
        app: [
            { nombre: "Onboarding", descripcion: "Pantallas iniciales para explicar el valor de la app." },
            { nombre: "Login/Registro", descripcion: "Acceso de usuarios con validaciones básicas." },
            { nombre: "Home App", descripcion: "Vista principal con acciones rápidas." },
            { nombre: "Perfil", descripcion: "Datos del usuario, preferencias y configuración." }
        ],
        sistema: [
            { nombre: "Login", descripcion: "Acceso seguro al sistema." },
            { nombre: "Dashboard", descripcion: "Indicadores, métricas y resumen operativo." },
            { nombre: "Gestión de registros", descripcion: "Crear, consultar, actualizar y eliminar información." },
            { nombre: "Reportes", descripcion: "Exportación o visualización de datos relevantes." }
        ]
    };
    const qrScreen = includeQr
        ? [{ nombre: "Generador de QR", descripcion: "Pantalla para crear códigos QR en tiempo real desde texto, enlace o información comercial." }]
        : [];
    return [...base, ...extras[projectType], ...qrScreen];
}
function buildStages(screenCount, complexity, includeQr) {
    const multiplier = getComplexityMultiplier(complexity);
    const qrHours = includeQr ? 8 : 0;
    return [
        { etapa: "Levantamiento de requerimientos", horas: Math.ceil(6 * multiplier), entregable: "Alcance funcional, objetivos, restricciones y criterios de aceptación." },
        { etapa: "Arquitectura y planificación", horas: Math.ceil(5 * multiplier), entregable: "Estructura técnica, módulos, modelo de datos inicial y backlog." },
        { etapa: "Diseño UX/UI", horas: Math.ceil(screenCount * 2.5 * multiplier), entregable: "Wireframes o pantallas base aprobables por el cliente." },
        { etapa: "Desarrollo frontend", horas: Math.ceil(screenCount * 4 * multiplier + qrHours), entregable: "Interfaz funcional y experiencia navegable." },
        { etapa: "Desarrollo backend / lógica", horas: Math.ceil(screenCount * 3.5 * multiplier + qrHours), entregable: "Reglas de negocio, API, persistencia e integración QR si aplica." },
        { etapa: "Pruebas y ajustes", horas: Math.ceil(screenCount * 1.5 * multiplier), entregable: "Corrección de errores, validación funcional y revisión con cliente." },
        { etapa: "Implementación y entrega", horas: Math.ceil(5 * multiplier), entregable: "Publicación, documentación breve y capacitación básica." }
    ];
}
function calculateProjectEstimate(input) {
    const projectType = input.tipoProyecto ?? inferProjectType(input.descripcion);
    const screens = buildScreens(projectType, input.incluirQr);
    const stages = buildStages(screens.length, input.complejidad, input.incluirQr);
    const totalHours = stages.reduce((sum, stage) => sum + stage.horas, 0);
    const subtotal = totalHours * input.tarifaHoraCRC;
    const contingency = Math.round(subtotal * 0.15);
    const total = subtotal + contingency;
    return {
        cliente: input.cliente ?? "Cliente sin nombre",
        tipo_proyecto_detectado: projectType,
        complejidad: input.complejidad,
        tarifa_hora_crc: input.tarifaHoraCRC,
        pantallas: screens,
        etapas: stages,
        total_horas_estimadas: totalHours,
        subtotal_crc: subtotal,
        contingencia_15_crc: contingency,
        precio_estimado_crc: total,
        precio_estimado_formateado: crcFormatter.format(total),
        observaciones: [
            "Estimación inicial sujeta a validación de requerimientos finales.",
            "No incluye costos de hosting, dominio, pasarelas de pago, licencias externas ni mantenimiento mensual.",
            "La contingencia del 15% cubre ajustes menores de alcance durante el desarrollo."
        ]
    };
}
server.registerTool("generar_qr", {
    title: "Generar QR en tiempo real",
    description: "Genera un código QR en SVG a partir de texto, enlace o información comercial.",
    inputSchema: {
        contenido: z.string().min(1).describe("Texto, URL o información que se codificará en el QR."),
        ancho: z.number().int().min(160).max(1000).default(320).describe("Tamaño del QR en píxeles."),
        margen: z.number().int().min(0).max(10).default(2).describe("Margen blanco alrededor del QR."),
    },
}, async ({ contenido, ancho, margen }) => {
    const svg = await QRCode.toString(contenido, {
        type: "svg",
        width: ancho,
        margin: margen,
        errorCorrectionLevel: "M",
    });
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify({
                    contenido,
                    formato: "svg",
                    qr_svg: svg,
                    recomendacion: "Copia el SVG en un archivo .svg o úsalo dentro de una página HTML.",
                }, null, 2),
            },
        ],
    };
});
server.registerTool("estimar_proyecto_cliente", {
    title: "Estimar proyecto de cliente",
    description: "Analiza una idea de proyecto y devuelve pantallas, etapas, horas y precio estimado en colones costarricenses.",
    inputSchema: {
        descripcion: z.string().min(10).describe("Descripción libre del proyecto del cliente."),
        cliente: z.string().optional().describe("Nombre del cliente o negocio."),
        tipoProyecto: z.enum(["landing", "web", "ecommerce", "app", "sistema"]).optional().describe("Tipo de proyecto si ya se conoce."),
        complejidad: z.enum(["baja", "media", "alta"]).default("media").describe("Nivel de complejidad estimado."),
        incluirQr: z.boolean().default(true).describe("Indica si el alcance incluye generador de QR en tiempo real."),
        tarifaHoraCRC: z.number().int().min(5000).max(50000).default(HOURLY_RATE_CRC).describe("Tarifa por hora en colones."),
    },
}, async (input) => {
    const estimate = calculateProjectEstimate(input);
    const qrPayload = `Cliente: ${estimate.cliente}\nProyecto: ${estimate.tipo_proyecto_detectado}\nHoras: ${estimate.total_horas_estimadas}\nPrecio: ${estimate.precio_estimado_formateado}`;
    const qrSvg = await QRCode.toString(qrPayload, {
        type: "svg",
        width: 320,
        margin: 2,
        errorCorrectionLevel: "M",
    });
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify({
                    ...estimate,
                    qr_resumen_svg: qrSvg,
                }, null, 2),
            },
        ],
    };
});
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}
main().catch((error) => {
    console.error("Error iniciando MCP server:", error);
    process.exit(1);
});
