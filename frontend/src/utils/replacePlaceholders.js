/**
 * Replaces placeholders in a template with values from recipient data
 * @param {string} template - The email template with placeholders
 * @param {object} recipient - Recipient data object
 * @returns {string} Personalized email content
 */
export function replacePlaceholders(template, recipient) {
  // Use recipient's raw data if available
  const data = recipient._raw || recipient;
  let content = template;
  
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key) && typeof data[key] === 'string') {
      // Create regex patterns that match exact placeholders
      const patterns = [
        `\\{${key}\\}`,         // {key}
        `\\{\\{${key}\\}\\}`,   // {{key}}
        `\\[${key}\\]`,         // [key]
        `\\[\\[${key}\\]\\]`,   // [[key]]
        `<${key}>`,              // <key>
        `<<${key}>>`            // <<key>>
      ];
      
      patterns.forEach(pattern => {
        const regex = new RegExp(pattern, 'g');
        content = content.replace(regex, data[key]);
      });
    }
  }
  
  return content;
}
