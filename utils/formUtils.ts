/**
 * Generates time options for dropdown selectors in 30-minute increments
 * @returns Array of time options with values and labels
 */
export const generateTimeOptions = () => {
    const options = [{ value: '24', label: '24 hours' }];

    for (let hour = 0; hour < 24; hour++) {
        const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        const period = hour < 12 ? 'AM' : 'PM';

        // Full hour
        options.push({
            value: `${hour.toString().padStart(2, '0')}:00`,
            label: `${hour12}:00 ${period}`,
        });

        // Half hour
        options.push({
            value: `${hour.toString().padStart(2, '0')}:30`,
            label: `${hour12}:30 ${period}`,
        });
    }

    return options;
};

/**
 * Formats a phone number to ensure it starts with '+62 '
 * @param event Input event from phone field
 * @returns Formatted phone number
 */
export const formatPhoneNumber = (event: Event) => {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // Handle backspace by checking if the value is just "+62 "
    if (value === '+62 ' || value === '+62') {
        return '+62 ';
    }

    // Remove non-digits except the plus sign and space
    value = value.replace(/[^\d+\s]/g, '');

    // If empty or just a plus, reset to "+62 "
    if (!value || value === '+') {
        return '+62 ';
    }

    // Ensure the number starts with "+62 "
    if (!value.startsWith('+62 ')) {
        // If user is typing without +62, add it
        value = value.replace(/^\+?62\s?|^0+/, ''); // Remove existing +62 or leading zeros
        return '+62 ' + value;
    } else {
        return value;
    }
};