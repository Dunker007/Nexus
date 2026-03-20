export default async (req: Request) => {
  return Response.json({ 
    status: 'ok', 
    message: 'DLX Netlify Functions Directory Initialized' 
  });
};

export const config = {
  path: "/api/netlify-health"
};
