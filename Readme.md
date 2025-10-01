# Mapa Interactivo de Residencias de Madrid

Esta aplicación muestra un mapa interactivo de la Comunidad de Madrid con la ubicación de diversas residencias para mayores. Al pasar el cursor sobre un punto en el mapa, se despliega una tarjeta con información detallada de la residencia correspondiente.

La aplicación está construida con React, TypeScript y Leaflet.js para el mapa.

## Despliegue con Docker

Para facilitar el despliegue y la ejecución de la aplicación, se utiliza Docker. Asegúrate de tener Docker instalado y en ejecución en tu máquina antes de continuar.

### Paso 1: Construir la imagen de Docker

Abre una terminal en la raíz de este proyecto (donde se encuentra el archivo `Dockerfile`) y ejecuta el siguiente comando. Este proceso compilará la aplicación y empaquetará todo lo necesario en una imagen de Docker.

```bash
docker build -t mapa-residencias .
```
- `-t mapa-residencias`: Asigna el nombre (tag) `mapa-residencias` a la imagen para que sea fácil de referenciar.
- `.`: Indica que el contexto de la construcción (los archivos del proyecto) se encuentra en el directorio actual.

### Paso 2: Ejecutar el contenedor

Una vez que la imagen se haya construido correctamente, inicia un contenedor a partir de ella con el siguiente comando:

```bash
docker run -d -p 8080:80 --name mi-mapa mapa-residencias
```
- `-d`: Ejecuta el contenedor en segundo plano (modo "detached").
- `-p 8080:80`: Mapea el puerto 8080 de tu máquina local al puerto 80 del contenedor, donde el servidor web Nginx está escuchando.
- `--name mi-mapa`: Asigna un nombre fácil de recordar al contenedor para gestionarlo posteriormente.
- `mapa-residencias`: Es el nombre de la imagen que creamos en el paso anterior.

### Paso 3: Acceder a la aplicación

¡Y eso es todo! La aplicación ya está en funcionamiento. Abre tu navegador web y visita la siguiente URL para verla:

[http://localhost:8080](http://localhost:8080)

---

### Comandos útiles de Docker

Aquí tienes algunos comandos que te pueden ser de utilidad para gestionar el contenedor:

- **Ver los contenedores que están en ejecución:**
  ```bash
  docker ps
  ```

- **Detener la ejecución del contenedor:**
  ```bash
  docker stop mi-mapa
  ```

- **Reiniciar el contenedor si lo has detenido:**
  ```bash
  docker start mi-mapa
  ```

- **Eliminar el contenedor (debe estar detenido primero):**
  ```bash
  docker rm mi-mapa
  ```
