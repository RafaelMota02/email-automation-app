export default async function handler(req, res) {
  try {
    // Ping the Render backend to keep it alive
    const response = await fetch('https://email-automation-app-t8ar.onrender.com');
    if (response.ok) {
      console.log('Keep-alive ping successful');
    } else {
      console.error('Keep-alive ping failed:', response.status, response.statusText);
    }
    res.status(200).json({ message: 'Ping sent' });
  } catch (error) {
    console.error('Error in keep-alive ping:', error);
    res.status(500).json({ error: 'Ping failed', details: error.message });
  }
}
