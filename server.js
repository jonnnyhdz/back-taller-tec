import express from "express";
import mysql from "mysql";
import cors from "cors";

const app = express();
const port = 3001;

app.use(cors());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "administrador",
});

db.connect((err) => {
  if (err) {
    console.error("Error al conectar a la base de datos:", err);
  } else {
    console.log("Conexión exitosa a la base de datos");
  }
});

app.use(express.json());

// Ruta para obtener todos los registros de la tabla 'registros'
app.get("/api/registros", (req, res) => {
  const sql = "SELECT * FROM registros";

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error al obtener registros:", err);
      res.status(500).json({ error: "Error interno del servidor" });
    } else {
      res.json(result);
    }
  });
});

// Ruta para guardar un nuevo registro en la tabla 'registros'
app.post("/api/registros", (req, res) => {
  const { nombre, correo, telefono, contrasena } = req.body;

  const sql =
    "INSERT INTO registros (nombre, correo, telefono, contrasena) VALUES (?, ?, ?, ?)";
  db.query(sql, [nombre, correo, telefono, contrasena], (err, result) => {
    if (err) {
      console.error("Error al insertar en la base de datos:", err);
      res.status(500).json({ error: "Error interno del servidor" });
    } else {
      console.log("Registro insertado correctamente");
      res.json({ success: true });
    }
  });
});

// Ruta para actualizar un registro por ID
app.put("/api/registros/:id", (req, res) => {
  const id = req.params.id;
  const { nombre, correo, telefono, contrasena } = req.body;

  const sql =
    "UPDATE registros SET nombre=?, correo=?, telefono=?, contrasena=? WHERE id=?";
  db.query(sql, [nombre, correo, telefono, contrasena, id], (err, result) => {
    if (err) {
      console.error("Error al actualizar el registro:", err);
      res.status(500).json({ error: "Error interno del servidor" });
    } else {
      console.log("Registro actualizado correctamente");
      res.json({ success: true });
    }
  });
});

// Ruta para eliminar un registro por ID
app.delete("/api/registros/:id", (req, res) => {
  const id = req.params.id;

  const sql = "DELETE FROM registros WHERE id=?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error al eliminar el registro:", err);
      res.status(500).json({ error: "Error interno del servidor" });
    } else {
      console.log("Registro eliminado correctamente");
      res.json({ success: true });
    }
  });
});

app.put("/api/multifactor/:id", (req, res) => {
  const id = req.params.id;
  const { activar } = req.body;

  const sql = "UPDATE registros SET  multifactor=? WHERE id=?";
  db.query(sql, [activar, id], (err, result) => {
    if (err) {
      console.error("Error al actualizar el registro:", err);
      res.status(500).json({ error: "Error interno del servidor" });
    } else {
      console.log("Registro actualizado correctamente");
      res.json({ success: true });
    }
  });
});

app.get("/api/verificarmultifactor/:correo", (req, res) => {
  const correo = req.params.correo;
  const password = req.query.password; // Suponiendo que la contraseña se pasa como un parámetro en la solicitud

  // Realiza una consulta SELECT para obtener los valores de multifactor y contraseña
  const selectSql = "SELECT correo, multifactor, contrasena FROM registros WHERE correo=?";
  db.query(selectSql, [correo], (selectErr, selectResult) => {
    if (selectErr) {
      console.error("Error al realizar la consulta SELECT:", selectErr);
      res.status(500).json({ error: "Error interno del servidor" });
    } else {
      // Verifica si se encontró un registro
      if (selectResult.length === 0) {
        res.status(404).json({ error: "Correo no encontrado" });
        return;
      }

      // Obtiene los valores de multifactor, correo y contraseña
      const { correo, multifactor, contrasena } = selectResult[0];
       //console.log("cotraseña de la db"+contrasena);
      // Verifica la contraseña
      if (contrasena !== password) {
        res.status(401).json({ error: "Contraseña incorrecta" });
        return;
      }

      // Retorna los valores en un objeto JSON
      res.json({ correo, multifactor });
    }
  });
});


app.put("/api/roles/:correo", (req, res) => {
  const correo = req.params.correo;
  const { activar2 } = req.body;

  const sql = "UPDATE registros SET roles=? WHERE correo=?";
  db.query(sql, [activar2, correo], (err, result) => {
    if (err) {
      console.error("Error al actualizar el registro:", err);
      res.status(500).json({ error: "Error interno del servidor" });
    } else {
      console.log("Registro actualizado correctamente");
      res.json({ success: true });
    }
  });
});

app.put("/api/proveedor/:correo", (req, res) => {
  const correo = req.params.correo;
  const { activar3, proveedor } = req.body;

  const sql = "UPDATE registros SET proveedor=?, proveedor=? WHERE correo=?";
  db.query(sql, [activar3, proveedor, correo], (err, result) => {
    if (err) {
      console.error("Error al actualizar el registro:", err);
      res.status(500).json({ error: "Error interno del servidor" });
    } else {
      console.log("Registro actualizado correctamente");
      res.json({ success: true });
    }
  });
});

app.get("/api/verificarroles/:correo/:token", (req, res) => {
  const correo = req.params.correo;
  const token = req.params.token;

  // Realiza una consulta SELECT para obtener los valores de roles y codigo
  const selectSql = "SELECT correo, roles, proveedor, codigo FROM registros WHERE correo=?";
  db.query(selectSql, [correo], (selectErr, selectResult) => {
    if (selectErr) {
      console.error("Error al realizar la consulta SELECT:", selectErr);
      res.status(500).json({ error: "Error interno del servidor" });
    } else {
      if (selectResult.length === 0) {
        res.status(404).json({ error: "Correo no encontrado" });
        return;
      }

      const { correo, roles, proveedor, codigo } = selectResult[0];

      if (token == -1) {
        res.json({ correo, roles, proveedor, codigo });
      } else {
        if (codigo == token) {
          res.json({ correo, roles, proveedor, codigo });
        } else {
          res.status(401).json({ error: "Token incorrecto" });
        }
      }
    }
  });
});






app.get("/api/verificarproveedor/:correo", (req, res) => {
  const correo = req.params.correo;

  // Realiza una consulta SELECT para obtener los valores de correo y proveedor
  const selectSql = "SELECT correo, proveedor FROM registros WHERE correo=?";
  db.query(selectSql, [correo], (selectErr, selectResult) => {
    if (selectErr) {
      console.error("Error al realizar la consulta SELECT:", selectErr);
      res.status(500).json({ error: "Error interno del servidor" });
    } else {
      // Verifica si se encontró un registro
      if (selectResult.length === 0) {
        res.status(404).json({ error: "Correo no encontrado" });
        return;
      }

      // Obtiene los valores de correo y proveedor
      const { correo, proveedor } = selectResult[0];

      // Verifica si el valor de proveedor es 0 o 1
      if (proveedor !== 0 && proveedor !== 1) {
        res.status(401).json({ error: "Valor de proveedor no válido" });
        return;
      }

      // Retorna los valores en un objeto JSON
      res.json({ correo, proveedor });
    }
  });
});








// Ruta para obtener todos los registros de la tabla 'servicios'
app.get("/api/servicios", (req, res) => {
  const sql = "SELECT * FROM servicios";

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error al obtener servicios:", err);
      res.status(500).json({ error: "Error interno del servidor" });
    } else {
      res.json(result);
    }
  });
});

// Ruta para guardar un nuevo servicio en la tabla 'servicios'
app.post("/api/servicios", (req, res) => {
  const { servicio_nombre, descripcion, precio } = req.body;

  const sql =
    "INSERT INTO servicios (servicio_nombre, descripcion, precio) VALUES (?, ?, ?)";
  db.query(sql, [servicio_nombre, descripcion, precio], (err, result) => {
    if (err) {
      console.error("Error al insertar servicio en la base de datos:", err);
      res.status(500).json({ error: "Error interno del servidor" });
    } else {
      console.log("Servicio insertado correctamente");
      res.json({ success: true });
    }
  });
});

// Ruta para actualizar un servicio por ID
app.put("/api/servicios/:id", (req, res) => {
  const id = req.params.id;
  const { servicio_nombre, descripcion, precio } = req.body;

  const sql =
    "UPDATE servicios SET servicio_nombre=?, descripcion=?, precio=? WHERE id=?";
  db.query(sql, [servicio_nombre, descripcion, precio, id], (err, result) => {
    if (err) {
      console.error("Error al actualizar el servicio:", err);
      res.status(500).json({ error: "Error interno del servidor" });
    } else {
      console.log("Servicio actualizado correctamente");
      res.json({ success: true });
    }
  });
});

// Ruta para eliminar un servicio por ID
app.delete("/api/servicios/:id", (req, res) => {
  const id = req.params.id;

  const sql = "DELETE FROM servicios WHERE id=?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error al eliminar el servicio:", err);
      res.status(500).json({ error: "Error interno del servidor" });
    } else {
      console.log("Servicio eliminado correctamente");
      res.json({ success: true });
    }
  });
});

// Ruta para obtener todas las piezas de la tabla 'piezas'
app.get("/api/piezas", (req, res) => {
  const sql = "SELECT * FROM piezas";

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error al obtener piezas:", err);
      res.status(500).json({ error: "Error interno del servidor" });
    } else {
      res.json(result);
    }
  });
});

// Ruta para guardar una nueva pieza en la tabla 'piezas'
app.post("/api/piezas", (req, res) => {
  const { nombre_pieza, cantidad, costo } = req.body;

  const sql =
    "INSERT INTO piezas (nombre_pieza, cantidad, costo) VALUES (?, ?, ?)";
  db.query(sql, [nombre_pieza, cantidad, costo], (err, result) => {
    if (err) {
      console.error("Error al insertar pieza en la base de datos:", err);
      res.status(500).json({ error: "Error interno del servidor" });
    } else {
      console.log("Pieza insertada correctamente");
      res.json({ success: true });
    }
  });
});

// Ruta para actualizar una pieza por ID
app.put("/api/piezas/:id", (req, res) => {
  const id = req.params.id;
  const { nombre_pieza, cantidad, costo } = req.body;

  const sql =
    "UPDATE piezas SET nombre_pieza=?, cantidad=?, costo=? WHERE id=?";
  db.query(sql, [nombre_pieza, cantidad, costo, id], (err, result) => {
    if (err) {
      console.error("Error al actualizar la pieza:", err);
      res.status(500).json({ error: "Error interno del servidor" });
    } else {
      console.log("Pieza actualizada correctamente");
      res.json({ success: true });
    }
  });
});

// Ruta para eliminar una pieza por ID
app.delete("/api/piezas/:id", (req, res) => {
  const id = req.params.id;

  const sql = "DELETE FROM piezas WHERE id=?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error al eliminar la pieza:", err);
      res.status(500).json({ error: "Error interno del servidor" });
    } else {
      console.log("Pieza eliminada correctamente");
      res.json({ success: true });
    }
  });
});

app.post("/api/registros_mecanicos", async (req, res) => {
  const {
    nombreCliente,
    modeloVehiculo,
    servicio_id,
    piezas_id,
    comentarios,
    costoTotal,
    tiempo,
  } = req.body;

  // Establecer estatus como "En proceso" por defecto
  const estatus = "En proceso";

  const sql =
    "INSERT INTO registros_mecanicos (nombreCliente, modeloVehiculo, servicio_id, piezas_id, comentarios, tiempo, costoTotal, estatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

  try {
    await db.query(
      sql,
      [
        nombreCliente,
        modeloVehiculo,
        servicio_id,
        piezas_id,
        comentarios,
        tiempo,
        costoTotal,
        estatus,
      ],
      (err, result) => {
        if (err) {
          console.error("Error al insertar en la base de datos:", err);
          res.status(500).json({
            error: "Error interno del servidor",
            fullError: err.message,
          });
        } else {
          console.log("Registro insertado correctamente");
          res.json({ success: true });
        }
      }
    );
  } catch (error) {
    console.error("Error al insertar en la base de datos:", error);
    res
      .status(500)
      .json({ error: "Error interno del servidor", fullError: error.message });
  }
});

app.get("/api/registros_mecanicos", (req, res) => {
  const sql = `
    SELECT
      registros_mecanicos.id AS id,
      registros_mecanicos.nombreCliente,
      registros_mecanicos.modeloVehiculo,
      registros_mecanicos.comentarios,
      registros_mecanicos.tiempo,
      registros_mecanicos.costoTotal,
      registros_mecanicos.estatus,
      servicios.servicio_nombre,
      servicios.descripcion AS servicio_descripcion,
      servicios.precio AS servicio_precio,
      piezas.nombre_pieza,
      piezas.cantidad AS pieza_cantidad,
      piezas.costo AS pieza_costo
    FROM registros_mecanicos
    JOIN servicios ON registros_mecanicos.servicio_id = servicios.id
    JOIN piezas ON registros_mecanicos.piezas_id = piezas.id
    GROUP BY registros_mecanicos.id;
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error al obtener registros mecánicos:", err);
      res.status(500).json({ error: "Error interno del servidor" });
    } else {
      res.json(result);
    }
  });
});

app.delete("/api/registros_mecanicos/:id", (req, res) => {
  const registroId = req.params.id;
  console.log(`Intentando eliminar el registro con ID: ${registroId}`);

  const sql = "DELETE FROM registros_mecanicos WHERE id = ?";

  db.query(sql, [registroId], (err, result) => {
    if (err) {
      console.error("Error al eliminar el registro:", err);
      res.status(500).json({ error: "Error interno del servidor" });
    } else {
      if (result.affectedRows === 0) {
        console.error(`No se encontró el registro con ID ${registroId}`);
        res.status(404).json({ error: "Registro no encontrado" });
      } else {
        console.log(`Registro con ID ${registroId} eliminado correctamente`);
        res.json({ message: "Registro eliminado correctamente" });
      }
    }
  });
});

app.put("/api/registros_mecanicos/:id", async (req, res) => {
  const registroId = req.params.id;
  const nuevosDatos = req.body;

  try {
    const registroActual = await obtenerRegistroMecanico(registroId);

    if (!registroActual) {
      return res.status(404).json({ error: "Registro mecánico no encontrado" });
    }

    const { comentarios, servicios_adicionales, piezas_adicionales } =
      nuevosDatos;

    // Iniciar la transacción
    db.beginTransaction(async (err) => {
      if (err) {
        console.error("Error al iniciar la transacción:", err);
        return res.status(500).json({ error: "Error interno del servidor" });
      }
      console.log('Transacción confirmada');

      try {
        // Actualizar comentarios
        const updateRegistroSQL = `
          UPDATE registros_mecanicos
          SET comentarios = ?
          WHERE id = ?;
        `;
        await db.query(updateRegistroSQL, [comentarios, registroId]);

        // Agregar nuevos servicios a la tabla registros_mecanicos
        if (servicios_adicionales && servicios_adicionales.length > 0) {
          for (const servicioId of servicios_adicionales) {
            console.log("Insertando servicio con ID:", servicioId);
            const insertServicioSQL = `
              INSERT INTO registros_mecanicos_servicios (registro_mecanico_id, servicio_id)
              VALUES (?, ?);
            `;
            await db.query(insertServicioSQL, [registroId, servicioId]);
          }
        }

        // Agregar nuevas piezas a la tabla registros_mecanicos
        if (piezas_adicionales && piezas_adicionales.length > 0) {
          for (const piezaId of piezas_adicionales) {
            console.log("Insertando pieza con ID:", piezaId);
            const insertPiezaSQL = `
              INSERT INTO registros_mecanicos_piezas (registro_mecanico_id, pieza_id)
              VALUES (?, ?);
            `;
            await db.query(insertPiezaSQL, [registroId, piezaId]);
          }
        }

        // Confirmar la transacción
        db.commit((commitErr) => {
          if (commitErr) {
            console.error("Error al confirmar la transacción:", commitErr);
            return res
              .status(500)
              .json({ error: "Error interno del servidor" });
          }

          res
            .status(200)
            .json({ message: "Registro actualizado correctamente" });
        });
      } catch (error) {
        // Revertir la transacción en caso de error
        db.rollback(() => {
          console.error("Error al actualizar el registro mecánico:", error);
          res.status(500).json({ error: "Error interno del servidor" });
        });
      }
    });
  } catch (error) {
    console.error("Error al obtener el registro mecánico:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

const obtenerRegistroMecanico = (registroId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT * FROM registros_mecanicos
      WHERE id = ?;
    `;

    db.query(sql, [registroId], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result[0]);
      }
    });
  });
};

// Ruta para obtener servicios adicionales de un registro mecánico
app.get(
  "/api/registros_mecanicos_servicios/:registro_mecanico_id",
  (req, res) => {
    const { registro_mecanico_id } = req.params;
    const sql = `
    SELECT
      servicios.servicio_nombre,
      servicios.descripcion AS servicio_descripcion,
      servicios.precio AS servicio_precio
    FROM registros_mecanicos_servicios
    JOIN servicios ON registros_mecanicos_servicios.servicio_id = servicios.id
    WHERE registros_mecanicos_servicios.registro_mecanico_id = ?;
  `;

    db.query(sql, [registro_mecanico_id], (err, result) => {
      if (err) {
        console.error("Error al obtener servicios adicionales:", err);
        res.status(500).json({ error: "Error interno del servidor" });
      } else {
        res.json(result);
      }
    });
  }
);

// Ruta para obtener piezas adicionales de un registro mecánico
app.get("/api/registros_mecanicos_piezas/:registro_mecanico_id", (req, res) => {
  const { registro_mecanico_id } = req.params;
  const sql = `
    SELECT
      piezas.nombre_pieza,
      piezas.cantidad AS pieza_cantidad,
      piezas.costo AS pieza_costo
    FROM registros_mecanicos_piezas
    JOIN piezas ON registros_mecanicos_piezas.pieza_id = piezas.id
    WHERE registros_mecanicos_piezas.registro_mecanico_id = ?;
  `;

  db.query(sql, [registro_mecanico_id], (err, result) => {
    if (err) {
      console.error("Error al obtener piezas adicionales:", err);
      res.status(500).json({ error: "Error interno del servidor" });
    } else {
      res.json(result);
    }
  });
});

// Inicia el servidor
app.listen(port, () => {
  console.log(`Servidor Express escuchando en el puerto ${port}`);
});
