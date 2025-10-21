export default function StatCard({ title, value, trend, icon }) {
  const getIcon = () => {
    switch (icon) {
      case '📨':
        return (
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        );
      case '📩':
        return (
          <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        );
      default:
        return <span className="text-4xl">{icon}</span>;
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 group">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider">{title}</p>
          <p className="text-4xl font-bold text-gray-900 mb-1">{value}</p>
          <p className="text-sm text-gray-600">{trend}</p>
        </div>
        <div className="ml-4 group-hover:scale-110 transition-transform duration-300">
          {getIcon()}
        </div>
      </div>
    </div>
  );
}
