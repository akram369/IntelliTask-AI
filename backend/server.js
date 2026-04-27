const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});


const initDB = async () => {
  try {
    await connectDB();
    await sequelize.sync({ alter: true });
    console.log('✅ Database connected & models synchronized');
  } catch (err) {
    console.error('❌ Database connection failed:', err);
  }
};

initDB();