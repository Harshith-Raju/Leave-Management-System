const { mongoose } = require('../config/database');

const DepartmentSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    name: { type: String, required: true, unique: true, trim: true },
    created_at: { type: Date, default: Date.now },
  },
  { collection: 'departments' }
);

module.exports =
  mongoose.models.Department || mongoose.model('Department', DepartmentSchema);

