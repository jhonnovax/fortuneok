export const getLocalDateFromUTCString = (dateString) => {
  const dateStringWithoutTimezone = dateString.split('T')[0];
  const localDate = new Date(`${dateStringWithoutTimezone}T00:00:00`);

  return localDate;
};