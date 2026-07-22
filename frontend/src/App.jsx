function App() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#1e1e1e",
        color: "#fff",
        fontFamily: "Segoe UI, sans-serif",
        padding: "30px",
      }}
    >
      <h1 style={{ color: "#f59e0b", marginBottom: 5 }}>
        ELINOR GESTIÓN
      </h1>

      <p>Sistema Integral para Pollerías</p>

      <hr />

      <h2>Dashboard</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 220px)",
          gap: "15px",
          marginTop: "25px",
        }}
      >
        <div style={card}>👥 Clientes</div>
        <div style={card}>🐔 Productos</div>
        <div style={card}>📦 Stock</div>
        <div style={card}>🚚 Compras</div>
        <div style={card}>🏭 Producción</div>
        <div style={card}>💲 Costos</div>
        <div style={card}>🛒 Ventas</div>
        <div style={card}>📈 Reportes</div>
        <div style={card}>⚙ Configuración</div>
      </div>

      <p style={{ marginTop: 40, color: "#999" }}>
        Versión 0.1.0
      </p>
    </div>
  );
}

const card = {
  background: "#2d2d2d",
  padding: "20px",
  borderRadius: "10px",
  cursor: "pointer",
  border: "1px solid #444",
};

export default App;