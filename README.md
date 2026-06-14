# MCP QR Project Estimator

Servidor MCP para Claude Desktop con dos herramientas:

1. `generar_qr`: genera un QR en SVG en tiempo real.
2. `estimar_proyecto_cliente`: recibe una idea de proyecto y devuelve pantallas, etapas, horas y precio estimado en colones costarricenses.

## Instalación

```bash
npm install
npm run build
```

## Ejecutar manualmente

```bash
npm start
```

## Configuración en Claude Desktop para macOS

Abre el archivo:

```bash
~/Library/Application Support/Claude/claude_desktop_config.json
```

Agrega:

```json
{
  "mcpServers": {
    "qr-project-estimator": {
      "command": "node",
      "args": ["/RUTA/ABSOLUTA/DEL/PROYECTO/dist/server.js"]
    }
  }
}
```

Después reinicia Claude Desktop.

## Ejemplo de uso en Claude

```text
Usa la herramienta estimar_proyecto_cliente para este proyecto:
Cliente: Tracy Salon
Necesita una web con reservas, catálogo de servicios, generador de QR para promociones y panel administrativo.
Complejidad media.
```
