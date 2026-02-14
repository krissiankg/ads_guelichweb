import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const portfolioData = [
  {
    "title": "docs.snb-jsan.bj",
    "category": "Link",
    "thumbnail_url": "https://www.gchristian.site/wp-content/uploads/2024/11/789shots_so.png",
    "project_url": "https://docs.snb-jsan.bj/",
    "description": null,
    "order_index": 1
  },
  {
    "title": "anique-store",
    "category": "Link",
    "thumbnail_url": "https://www.gchristian.site/wp-content/uploads/2024/11/64shots_so.png",
    "project_url": "https://anique-store.creator-spring.com/?page=2",
    "description": null,
    "order_index": 2
  },
  {
    "title": "snb-jsan.bj",
    "category": "Link",
    "thumbnail_url": "https://www.gchristian.site/wp-content/uploads/2024/11/451shots_so.png",
    "project_url": "https://snb-jsan.bj",
    "description": null,
    "order_index": 3
  },
  {
    "title": "lebecasso.org",
    "category": "Link",
    "thumbnail_url": "https://www.gchristian.site/wp-content/uploads/2024/11/573shots_so.png",
    "project_url": "http://lebecasso.org.guelichweb.site/",
    "description": null,
    "order_index": 4
  },
  {
    "title": "interieurinspire.online",
    "category": "Link",
    "thumbnail_url": "https://www.gchristian.site/wp-content/uploads/2024/11/830shots_so.png",
    "project_url": "https://interieurinspire.online",
    "description": null,
    "order_index": 5
  },
  {
    "title": "spassmitdeutschbenin.com",
    "category": "Link",
    "thumbnail_url": "https://www.gchristian.site/wp-content/uploads/2024/11/187shots_so.png",
    "project_url": "https://spassmitdeutschbenin.com/",
    "description": null,
    "order_index": 6
  },
  {
    "title": "guelichweb.site",
    "category": "Link",
    "thumbnail_url": "https://www.gchristian.site/wp-content/uploads/2024/11/223shots_so.png",
    "project_url": "https://www.guelichweb.site",
    "description": null,
    "order_index": 7
  },
  {
    "title": "Guelichweb Promo Plus",
    "category": "Video",
    "thumbnail_url": "https://www.gchristian.site/wp-content/uploads/2023/12/guelichweb.jpg",
    "project_url": "https://vimeo.com/896972087?share=copy",
    "description": null,
    "order_index": 8
  },
  {
    "title": "Menu de Restaurant",
    "category": "Gallery",
    "thumbnail_url": "https://www.gchristian.site/wp-content/uploads/2023/12/voir1-1200x800.jpg",
    "project_url": null,
    "description": null,
    "order_index": 9
  },
  {
    "title": "Agence tourisme Vidéo",
    "category": "Video",
    "thumbnail_url": "https://www.gchristian.site/wp-content/uploads/2023/09/GDCOAT-1200x675.jpg",
    "project_url": "https://vimeo.com/865752199?share=copy",
    "description": null,
    "order_index": 10
  },
  {
    "title": "Agence tourisme Affiche",
    "category": "Gallery",
    "thumbnail_url": "https://www.gchristian.site/wp-content/uploads/2023/09/gdcoat1.jpg",
    "project_url": null,
    "description": null,
    "order_index": 11
  },
  {
    "title": "WEB UI KIT",
    "category": "UI KIT",
    "thumbnail_url": "https://www.gchristian.site/wp-content/uploads/2023/03/Master_Flow__01_Home-1200x4543.png",
    "project_url": null,
    "description": null,
    "order_index": 12
  },
  {
    "title": "NFT",
    "category": "Illustration",
    "thumbnail_url": "https://www.gchristian.site/wp-content/uploads/2023/03/Token-1200x1205.png",
    "project_url": null,
    "description": null,
    "order_index": 13
  },
  {
    "title": "3D CHARACTER",
    "category": "Illustration",
    "thumbnail_url": "https://www.gchristian.site/wp-content/uploads/2023/03/COVER-1200x923.png",
    "project_url": null,
    "description": null,
    "order_index": 14
  },
  {
    "title": "Social Media Ui KIT",
    "category": "Community Manager",
    "thumbnail_url": "https://www.gchristian.site/wp-content/uploads/2023/03/main-page.png",
    "project_url": null,
    "description": null,
    "order_index": 15
  },
  {
    "title": "Travel website - GDCOAT",
    "category": "Link",
    "thumbnail_url": "https://www.gchristian.site/wp-content/uploads/2022/10/screenshot20230723201324-1200x578.png",
    "project_url": "https://gdcoat-afrique.com/",
    "description": null,
    "order_index": 16
  },
  {
    "title": "snb.bj",
    "category": "Link",
    "thumbnail_url": "https://www.gchristian.site/wp-content/uploads/2020/04/769shots_so.png",
    "project_url": "http://snb.bj/",
    "description": null,
    "order_index": 17
  }
];

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const importResponse = await fetch(
      `${supabaseUrl}/rest/v1/portfolio_projects`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(portfolioData),
      }
    );

    if (!importResponse.ok) {
      const error = await importResponse.text();
      console.error('Import error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to import portfolio data', details: error }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const imported = await importResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully imported ${portfolioData.length} portfolio projects`,
        count: portfolioData.length,
        projects: imported
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
