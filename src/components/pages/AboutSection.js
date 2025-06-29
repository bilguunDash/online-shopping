import React from 'react';
import {
    Container,
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Avatar,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Paper,
    Button
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import StoreIcon from '@mui/icons-material/Store';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SecurityIcon from '@mui/icons-material/Security';
import TimelineIcon from '@mui/icons-material/Timeline';

const AboutSection = () => {
    const teamMembers = [
        {
            name: 'Сараа Жонсон',
            role: 'Гүйцэтгэх захирал',
            bio: 'Жижиглэн худалдааны технологид 15 жилийн туршлагатай Сараа манай компанийн алсын хараа, стратегийг удирддаг.',
            avatar: '/images/team/sarah.jpg'
        },
        {
            name: 'Давид Чен',
            role: 'Технологийн захирал',
            bio: 'Давид нь масштабжих боломжтой и-худалдааны платформ байгуулах 12 жилийн туршлагатай.',
            avatar: '/images/team/david.jpg'
        },
        {
            name: 'Мариа Родригез',
            role: 'Хэрэглэгчийн туршлагын дарга',
            bio: 'Мариа манай хэрэглэгчдэд шилдэг худалдан авалтын туршлага олгодог.',
            avatar: '/images/team/maria.jpg'
        },
        {
            name: 'Жеймс Вилсон',
            role: 'Нийлүүлэлтийн хэлхээний захирал',
            bio: 'Жеймс манай дэлхийн нийлүүлэлтийн сүлжээ, нөөцийн удирдлагыг хариуцдаг.',
            avatar: '/images/team/james.jpg'
        }
    ];

    const milestones = [
        { year: '2018', event: 'Хэрэглэгчийн электрон бүтээгдэхүүнд анхаарлаа хандуулан компани байгуулагдав' },
        { year: '2019', event: '200 бүтээгдэхүүнтэй анхны онлайн дэлгүүрээ нээв' },
        { year: '2020', event: 'Гар утас, дагалдах хэрэгслийн чиглэлээр өргөжив' },
        { year: '2021', event: '10,000 хэрэглэгчтэй болж, анхны биет дэлгүүрээ нээв' },
        { year: '2022', event: '15 улс руу олон улсын хүргэлт нэмэв' },
        { year: '2023', event: 'Мобайл апп болон лоялти хөтөлбөрөө нэвтрүүлэв' },
        { year: '2024', event: 'Зөөврийн компьютер, ухаалаг гэрийн технологи руу өргөжиж байна' }
    ];

    const values = [
        {
            title: 'Чанартай Бүтээгдэхүүн',
            description: 'Бид гүйцэтгэл, найдвартай байдлын өндөр шаардлагыг хангасан шилдэг технологийн бүтээгдэхүүнийг сонгодог.',
            icon: <CheckCircleOutlineIcon sx={{ fontSize: 40, color: '#1e4620' }} />
        },
        {
            title: 'Хэрэглэгчийн Сэтгэл Ханамж',
            description: 'Таны сэтгэл ханамж бидний тэргүүлэх зорилго. Бид таны хүлээлтээс давсан үйлчилгээ үзүүлэхийн төлөө ажилладаг.',
            icon: <SupportAgentIcon sx={{ fontSize: 40, color: '#1e4620' }} />
        },
        {
            title: 'Хурдан Хүргэлт',
            description: 'Бид таны бүтээгдэхүүнийг хурдан, аюулгүй хүргэхийн тулд шилдэг ложистикийн байгууллагуудтай хамтран ажилладаг.',
            icon: <LocalShippingIcon sx={{ fontSize: 40, color: '#1e4620' }} />
        },
        {
            title: 'Аюулгүй Худалдан Авалт',
            description: 'Таны мэдээллийн аюулгүй байдал нэн чухал. Бид бүх гүйлгээг хамгаалахын тулд банкны түвшний шифрлэлтийг ашигладаг.',
            icon: <SecurityIcon sx={{ fontSize: 40, color: '#1e4620' }} />
        }
    ];

    return (
        <Box sx={{
            position: 'relative',
            pt: { xs: 10, md: 15 },
            pb: 8,
            '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `
                    linear-gradient(135deg, rgba(30, 70, 32, 0.03) 25%, transparent 25%) -10px 0,
                    linear-gradient(225deg, rgba(30, 70, 32, 0.03) 25%, transparent 25%) -10px 0,
                    linear-gradient(315deg, rgba(30, 70, 32, 0.03) 25%, transparent 25%),
                    linear-gradient(45deg, rgba(30, 70, 32, 0.03) 25%, transparent 25%)
                `,
                backgroundSize: '20px 20px',
                backgroundColor: '#fafcfa',
                zIndex: -1,
            }
        }}>
            {/* Hero Section */}
            <Container maxWidth="lg">
                <Box
                    sx={{
                        textAlign: 'center',
                        mb: 8,
                        position: 'relative',
                        py: 6
                    }}
                >
                    <Typography
                        variant="h2"
                        component="h1"
                        sx={{
                            fontWeight: 800,
                            mb: 3,
                            background: 'linear-gradient(45deg, #1e4620 30%, #4caf50 90%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            textShadow: '0px 2px 3px rgba(0,0,0,0.05)'
                        }}
                    >
                        анай компанийн тухай
                    </Typography>
                    <Typography
                        variant="h5"
                        sx={{
                            maxWidth: 800,
                            mx: 'auto',
                            color: '#555',
                            mb: 4,
                            lineHeight: 1.6
                        }}
                    >
                        Бид хамгийн шилдэг технологийг таны босгон дээр авчирч, хамгийн сүүлийн үеийн технологийг хүн бүрт хүртээмжтэй болгох зорилготой.
                    </Typography>
                    <Box
                        sx={{
                            width: 100,
                            height: 4,
                            backgroundColor: '#1e4620',
                            mx: 'auto',
                            mb: 5
                        }}
                    />

                    <Grid container spacing={4} justifyContent="center">
                        <Grid item xs={12} md={6}>
                            <Box
                                component="img"
                                src="/images/about-hero.jpg"
                                alt="Our modern office"
                                sx={{
                                    width: '100%',
                                    height: 'auto',
                                    borderRadius: 3,
                                    boxShadow: '0 16px 40px rgba(0,0,0,0.12)',
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box sx={{ textAlign: 'left', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>Бидний Түүх</Typography>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        mb: 2,
                                        color: '#555',
                                        lineHeight: 1.8
                                    }}
                                >
                                    2018 онд үүсгэн байгуулагдсан бид өндөр чанартай технологийг хүн бүрт хүртээмжтэй болгох гэсэн энгийн санаагаар эхэлсэн. Цөөн тооны бүтээгдэхүүнтэй жижиг дэлгүүрээс эхэлсэн зүйл нь технологийн цахим худалдааны иж бүрэн платформ болжээ.
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        mb: 3,
                                        color: '#555',
                                        lineHeight: 1.8
                                    }}
                                >
                                    Хүн бүр орчин үеийн амьдралыг сайжруулах хэрэгсэлд хандах эрхтэй гэдэгт бид итгэдэг. Ухаалаг гар утаснаас эхлээд зөөврийн компьютер, аудио төхөөрөмж, ухаалаг гэрийн төхөөрөмж хүртэл бид таны өдөр тутмын хэрэглээг сайжруулах бүтээгдэхүүнийг сонгодог.
                                </Typography>

                                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                                    <Button
                                        variant="contained"
                                        sx={{
                                            bgcolor: '#1e4620',
                                            '&:hover': { bgcolor: '#143314' },
                                            textTransform: 'none',
                                            px: 3
                                        }}
                                    >
                                        Бидний Бүтээгдэхүүн
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        sx={{
                                            borderColor: '#1e4620',
                                            color: '#1e4620',
                                            '&:hover': { borderColor: '#143314', bgcolor: 'rgba(30, 70, 32, 0.04)' },
                                            textTransform: 'none',
                                            px: 3
                                        }}
                                    >
                                        Холбоо барих
                                    </Button>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>

                {/* Our Values */}
                <Box sx={{ mb: 10 }}>
                    <Typography
                        variant="h3"
                        component="h2"
                        sx={{
                            textAlign: 'center',
                            mb: 6,
                            fontWeight: 700,
                            position: 'relative',
                            '&::after': {
                                content: '""',
                                position: 'absolute',
                                bottom: -16,
                                left: '50%',
                                width: 80,
                                height: 4,
                                backgroundColor: '#1e4620',
                                transform: 'translateX(-50%)',
                                borderRadius: 2
                            }
                        }}
                    >
                        Бидний Үнэт Зүйлс
                    </Typography>

                    <Grid container spacing={4}>
                        {values.map((value, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 4,
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        textAlign: 'center',
                                        borderRadius: 3,
                                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                        backdropFilter: 'blur(5px)',
                                        border: '1px solid rgba(30, 70, 32, 0.08)',
                                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-8px)',
                                            boxShadow: '0 12px 20px rgba(0,0,0,0.08)',
                                            backgroundColor: 'rgba(255, 255, 255, 0.95)'
                                        }
                                    }}
                                >
                                    <Box sx={{ 
                                        mb: 2,
                                        p: 2,
                                        bgcolor: 'rgba(30, 70, 32, 0.1)',
                                        borderRadius: '50%'
                                    }}>
                                        {value.icon}
                                    </Box>
                                    <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
                                        {value.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {value.description}
                                    </Typography>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* Meet the Team */}
                <Box sx={{ mb: 10 }}>
                    <Typography
                        variant="h3"
                        component="h2"
                        sx={{
                            textAlign: 'center',
                            mb: 6,
                            fontWeight: 700,
                            position: 'relative',
                            '&::after': {
                                content: '""',
                                position: 'absolute',
                                bottom: -16,
                                left: '50%',
                                width: 80,
                                height: 4,
                                backgroundColor: '#1e4620',
                                transform: 'translateX(-50%)',
                                borderRadius: 2
                            }
                        }}
                    >
                        Бидний Баг
                    </Typography>

                    <Grid container spacing={4}>
                        {teamMembers.map((member, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card
                                    elevation={0}
                                    sx={{
                                        height: '100%',
                                        borderRadius: 3,
                                        overflow: 'hidden',
                                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                        backdropFilter: 'blur(5px)',
                                        border: '1px solid rgba(30, 70, 32, 0.08)',
                                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-8px)',
                                            boxShadow: '0 12px 20px rgba(0,0,0,0.08)',
                                            backgroundColor: 'rgba(255, 255, 255, 0.95)'
                                        }
                                    }}
                                >
                                    <Box
                                        sx={{
                                            height: 240,
                                            background: 'linear-gradient(135deg, rgba(30, 70, 32, 0.05) 0%, rgba(76, 175, 80, 0.1) 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <Avatar
                                            src={member.avatar}
                                            alt={member.name}
                                            sx={{
                                                width: 160,
                                                height: 160,
                                                border: '4px solid white',
                                                boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                                            }}
                                        />
                                    </Box>
                                    <CardContent sx={{ textAlign: 'center' }}>
                                        <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 0.5 }}>
                                            {member.name}
                                        </Typography>
                                        <Typography variant="subtitle2" color="primary" sx={{ mb: 2, color: '#1e4620' }}>
                                            {member.role}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {member.bio}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* Our Journey */}
                <Box sx={{ 
                    mb: 8, 
                    position: 'relative',
                    py: 6,
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(to right, rgba(30, 70, 32, 0.05), rgba(255, 255, 255, 0.6), rgba(30, 70, 32, 0.05))',
                        borderRadius: 4,
                        zIndex: -1,
                    }
                }}>
                    <Typography
                        variant="h3"
                        component="h2"
                        sx={{
                            textAlign: 'center',
                            mb: 6,
                            fontWeight: 700,
                            position: 'relative',
                            '&::after': {
                                content: '""',
                                position: 'absolute',
                                bottom: -16,
                                left: '50%',
                                width: 80,
                                height: 4,
                                backgroundColor: '#1e4620',
                                transform: 'translateX(-50%)',
                                borderRadius: 2
                            }
                        }}
                    >
                        Бидний Аялал
                    </Typography>

                    <Box sx={{ position: 'relative', px: 4 }}>
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                bottom: 0,
                                left: '50%',
                                width: 4,
                                backgroundColor: '#e0e0e0',
                                transform: 'translateX(-50%)',
                                zIndex: 0
                            }}
                        />

                        {milestones.map((milestone, index) => (
                            <Box
                                key={index}
                                sx={{
                                    display: 'flex',
                                    flexDirection: { xs: 'column', md: index % 2 === 0 ? 'row' : 'row-reverse' },
                                    alignItems: { xs: 'center', md: 'flex-start' },
                                    mb: 5,
                                    position: 'relative',
                                    zIndex: 1
                                }}
                            >
                                <Box
                                    sx={{
                                        width: { xs: '100%', md: '50%' },
                                        pr: { md: index % 2 === 0 ? 4 : 0 },
                                        pl: { md: index % 2 === 0 ? 0 : 4 },
                                        pb: { xs: 3, md: 0 },
                                        textAlign: { xs: 'center', md: index % 2 === 0 ? 'right' : 'left' }
                                    }}
                                >
                                    <Typography variant="h4" component="h3" sx={{ fontWeight: 700, color: '#1e4620' }}>
                                        {milestone.year}
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: '#555' }}>
                                        {milestone.event}
                                    </Typography>
                                </Box>

                                <Box
                                    sx={{
                                        display: { xs: 'none', md: 'flex' },
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        width: 40,
                                        height: 40,
                                        borderRadius: '50%',
                                        backgroundColor: '#1e4620',
                                        position: 'absolute',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        zIndex: 2
                                    }}
                                >
                                    <TimelineIcon sx={{ color: 'white', fontSize: 20 }} />
                                </Box>

                                <Box sx={{ width: { xs: '100%', md: '50%' } }} />
                            </Box>
                        ))}
                    </Box>
                </Box>

                {/* Stats Section */}
                <Box
                    sx={{
                        py: 8,
                        px: 4,
                        borderRadius: 4,
                        background: 'linear-gradient(135deg, #1e4620 0%, #2e8038 100%)',
                        boxShadow: '0 10px 30px rgba(30, 70, 32, 0.2)',
                        color: 'white',
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: '-50%',
                            left: '-50%',
                            right: '-50%',
                            bottom: '-50%',
                            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
                            transform: 'rotate(30deg)',
                        }
                    }}
                >
                    <Grid container spacing={4}>
                        <Grid item xs={6} md={3}>
                            <Typography variant="h3" component="p" sx={{ fontWeight: 700 }}>15K+</Typography>
                            <Typography variant="subtitle1">Happy Customers</Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Typography variant="h3" component="p" sx={{ fontWeight: 700 }}>500+</Typography>
                            <Typography variant="subtitle1">Products</Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Typography variant="h3" component="p" sx={{ fontWeight: 700 }}>24/7</Typography>
                            <Typography variant="subtitle1">Customer Support</Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Typography variant="h3" component="p" sx={{ fontWeight: 700 }}>15+</Typography>
                            <Typography variant="subtitle1">Countries Served</Typography>
                        </Grid>
                    </Grid>
                </Box>
            </Container>
        </Box>
    );
};

export default AboutSection;
