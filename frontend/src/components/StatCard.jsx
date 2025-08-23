export default function StatCard({ title, value, trend, icon }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-semibold">{value}</p>
          <p className="text-sm text-gray-500 mt-2">{trend}</p>
        </div>
        <span className="text-4xl">{icon}</span>
      </div>
    </div>
  );
}
