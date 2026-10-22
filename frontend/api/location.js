// Vercel supplies city-level geolocation. Never return or retain the visitor IP.
export default function handler(request, response) {
  response.setHeader('Cache-Control','private, max-age=3600');
  if(request.method !== 'GET') return response.status(405).json({success:false});
  const lat=request.headers['x-vercel-ip-latitude'];
  const lon=request.headers['x-vercel-ip-longitude'];
  const latitude=Number(lat),longitude=Number(lon);
  if(!lat||!lon||!Number.isFinite(latitude)||!Number.isFinite(longitude)||Math.abs(latitude)>90||Math.abs(longitude)>180){
    response.setHeader('Cache-Control','no-store');
    return response.status(200).json({success:false});
  }
  return response.status(200).json({success:true,latitude:Math.round(latitude*10)/10,longitude:Math.round(longitude*10)/10});
}
