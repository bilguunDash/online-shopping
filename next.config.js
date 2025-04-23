/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    disableStaticImages: false,
    domains: [
      "cdn.iphoneincanada.ca",
      "fdn2.gsmarena.com",
      "store.storeimages.cdn-apple.com",
      "bestcomputers.mn",
      "images.samsung.com",
      "i.dell.com",
      "m.media-amazon.com",
      "cdnp.cody.mn",
      "p1-ofp.static.pub",
      "p3-ofp.static.pub",
      "p2-ofp.static.pub",
      "p4-ofp.static.pub",
      "cdsassets.apple.com",
      "www.sammyfans.com",
      "dlcdnwebimgs.asus.com"
    ]
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/home',
        permanent: false, // Set to true if this is a permanent redirect
      },
    ];
  },
};

module.exports = nextConfig;