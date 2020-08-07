export default function convertHoursToMinutes(time: string) {

    //Expected format => 12:00

    const [hour, minutes] = time.split(':').map(Number);

    const timeInMinutes = hour * 60 + minutes;

    return timeInMinutes;
    
}