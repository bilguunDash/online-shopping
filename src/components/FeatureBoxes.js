// components/FeatureBoxes.js
import React from "react";
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Paper, 
  Card,
  CardContent,
  CardMedia
} from '@mui/material';

const FeatureBoxes = () => {
  const features = [
    {
      image: "/images/thr.png",
      title: "Суурин Компьютер",
      description: "Манай дэлгүүрт оффис болон тоглоомын зориулалттай сүүлийн үеийн брэнд компьютерууд худалдаалагдаж байна. Та хэрэгцээндээ тохирсон өндөр хүчин чадалтай, найдвартай компьютерийг хамгийн өрсөлдөхүйц үнээр худалдан авах боломжтой."
    },
    {
      image: "/images/thr1.png",
      title: "Зөөврийн Компьютер",
      description: "Шинэ үеийн зөөврийн компьютерууд танд ажлын бүтээмж, хурд, загварын төгс хослолыг санал болгож байна. Apple, Dell, HP, ASUS зэрэг дэлхийд танигдсан брэндүүдийн албан ёсны бүтээгдэхүүнүүд манайд бэлэн."
    },
    {
      image: "/images/thr2.png",
      title: "Таблет",
      description: "Боловсрол, бизнес, энтертайнментэд зориулсан таблетуудын өргөн сонголт. iPad, Samsung Galaxy Tab, Lenovo зэрэг хэрэглээнд нийцсэн ухаалаг төхөөрөмжүүдийг бид танд шуурхай хүргэнэ."
    }
  ];

  return (
    <Box sx={{ py: 6, bgcolor: "#f8f9fa" }}>
      <Container>
        <Box sx={{ mb: 5, textAlign: "center" }}>
          <Typography 
            variant="h3" 
            component="h2" 
            sx={{ 
              fontWeight: "bold",
              mb: 2,
              position: 'relative',
              display: 'inline-block',
              '&::after': {
                content: '""',
                position: 'absolute',
                width: '60px',
                height: '3px',
                backgroundColor: 'primary.main',
                bottom: '-10px',
                left: '50%',
                transform: 'translateX(-50%)',
              }
            }}
          >
            Дэлгүүрийн онцлог
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card 
                elevation={2}
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-10px)',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                  }
                }}
              >
                <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
                  <Box 
                    component="img" 
                    src={feature.image} 
                    alt={feature.title}
                    sx={{ 
                      height: 80,
                      width: 'auto',
                      mb: 2,
                      filter: 'drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.1))'
                    }}
                  />
                </Box>
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', px: 3 }}>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default FeatureBoxes;