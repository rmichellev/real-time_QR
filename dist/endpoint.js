import express from "express";
import QRCode from "qrcode";
const app = express();
const port = Number(process.env.PORT ?? 3000);
app.use(express.json());
app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "qr-project-estimator-endpoint" });
});
app.post("/qr", async (req, res) => {
    try {
        const { contenido, ancho = 320, margen = 2 } = req.body ?? {};
        if (!contenido || typeof contenido !== "string") {
            return res.status(400).json({ error: "Debe enviar 'contenido' como texto." });
        }
        const svg = await QRCode.toString(contenido, {
            type: "svg",
            width: Number(ancho),
            margin: Number(margen),
            errorCorrectionLevel: "M",
        });
        res.type("image/svg+xml").send(svg);
    }
    catch (error) {
        res.status(500).json({ error: "No se pudo generar el QR." });
    }
});
app.listen(port, "0.0.0.0", () => {
    console.log(`Endpoint QR activo en http://localhost:${port}`);
});
