# Guía rápida: VS Code + Claude Desktop + MCP

## 1. Abrir el proyecto en VS Code

Desde Terminal:

```bash
cd ~/Desktop/mcp-qr-estimator
code .
```

Si `code .` no funciona, abre VS Code y usa:

```text
File > Open Folder > mcp-qr-estimator
```

## 2. Instalar dependencias

En la terminal integrada de VS Code:

```bash
npm install
```

## 3. Compilar

```bash
npm run build
```

Debe crearse la carpeta `dist`.

## 4. Probar endpoint QR opcional

```bash
npm run endpoint
```

Abre en el navegador:

```text
http://localhost:3000/qr?text=https://google.com
```

## 5. Configurar Claude Desktop

Archivo en Mac:

```bash
~/Library/Application Support/Claude/claude_desktop_config.json
```

Ejemplo:

```json
{
  "mcpServers": {
    "qr-project-estimator": {
      "command": "node",
      "args": ["/Users/TU_USUARIO/Desktop/mcp-qr-estimator/dist/server.js"]
    }
  }
}
```

Después de guardar, cierra Claude Desktop completamente y vuelve a abrirlo.

## 6. Probar en Claude

```text
Usa la herramienta estimar_proyecto_cliente.

Proyecto: app de reservas para salón de uñas con pagos SINPE, administración de citas, catálogo de servicios y QR promocional.
Complejidad: media.
Tarifa por hora: 12000 colones.
```

## 7. Usar tareas de VS Code

En VS Code:

```text
Terminal > Run Task
```

Tareas disponibles:

- MCP: npm install
- MCP: build
- MCP: start Claude server
- MCP: start QR endpoint

## Nota importante

Claude Desktop ejecuta el MCP Server por su cuenta cuando está configurado. No necesitas dejar corriendo `npm run start` manualmente para Claude. Solo necesitas que el proyecto esté compilado y que la ruta del archivo `dist/server.js` sea correcta.
