import express from "express";
import mysql from "mysql";
import cors from 'cors';

const app = express();
app.use(
  express.json(),
  cors()
);

const conexion = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'arduino'
});

conexion.connect(function (error) {
  if (error) {
    console.log("Error al conectar");
  } else {
    console.log("Conexion realizada exitosamente");
  }
});

app.get('/obtenermensajes', (req, res) => {
    const sql = "SELECT mensaje, dato_sensor, hora, color_led FROM detecciones ORDER BY id DESC LIMIT 100";
  conexion.query(sql, (error, resultado) => {
    if (error) return res.status(500).json({ error: "Error en la consulta" });
    return res.status(200).json(resultado);
  });
});


app.get('/obtenermensajesultra', (req, res) => {
  const sql = "SELECT mensaje, distancia, fecha FROM tb_puerto_serial ORDER BY id DESC LIMIT 100";
  conexion.query(sql, (error, resultado) => {
      if (error) return res.status(500).json({ error: "Error en la consulta" });
      return res.status(200).json(resultado);
  });
});


app.post('/crearmensajes', (req, res) => {
  const { mensaje, dato_sensor } = req.body;
  const sql = "INSERT INTO tb_puerto_serial (mensaje, dato_sensor) VALUES (?, ?)";
  conexion.query(sql, [mensaje, dato_sensor], (error, resultado) => {
    if (error) return res.status(500).json({ error: "Error al crear el mensaje" });
    return res.status(201).json({ message: "Mensaje creado exitosamente", id: resultado.insertId });
  });
});

app.put('/actualizarmensajes/:id', (req, res) => {
  const { mensaje, dato_sensor } = req.body;
  const { id } = req.params;
  const sql = "UPDATE tb_puerto_serial SET mensaje = ?, dato_sensor = ? WHERE id = ?";
  conexion.query(sql, [mensaje, dato_sensor, id], (error, resultado) => {
    if (error) return res.status(500).json({ error: "Error al actualizar el mensaje" });
    if (resultado.affectedRows === 0) return res.status(404).json({ error: "Mensaje no encontrado" });
    return res.status(200).json({ message: "Mensaje actualizado exitosamente" });
  });
});

app.delete('/borrarmensajes/:id', (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM tb_puerto_serial WHERE id = ?";
  conexion.query(sql, [id], (error, resultado) => {
    if (error) return res.status(500).json({ error: "Error al borrar el mensaje" });
    if (resultado.affectedRows === 0) return res.status(404).json({ error: "Mensaje no encontrado" });
    return res.status(200).json({ message: "Mensaje borrado exitosamente" });
  });
});

app.get('/obtenerDeteccionBetween', (req, res) => {
  const min = req.query.min;
  const max = req.query.max;
  const sql = "SELECT * FROM detecciones WHERE dato_sensor BETWEEN ? AND ?";
  conexion.query(sql, [min, max], (error, resultado) => {
    if (error) {
      return res.status(500).json({ error: "Error en la consulta" });
    }
    return res.status(200).json(resultado);
  });
});

app.get('/favicon.ico', (req, res) => res.status(204).end());

app.listen(8082, () => {
  console.log("Servidor en el puerto 8082");
});
