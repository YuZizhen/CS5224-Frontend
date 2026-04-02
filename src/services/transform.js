// Transforms raw vessel data from the API into a standardized format for the application.
// Only need to change this function if the API response structure changes.

export function transformVessels(responseData) {
  const vessels = responseData?.vessels || responseData || [];

  return vessels.map((v) => ({
    id: v.mmsi || v.id,
    name: v.vessel_name || v.name || 'Unknown Vessel',
    lat: Number(v.lat),
    lng: Number(v.lng),
    heading: v.heading ?? 0,
    speed: v.sog ?? 0,
    course: v.cog ?? 0,
    status: v.status || 'unknown',
    vesselType: v.vessel_type || 'other',
    updatedAt: v.updated_at || null,
    raw: v,
  }));
}