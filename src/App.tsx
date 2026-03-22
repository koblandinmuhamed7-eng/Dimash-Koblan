/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ChevronLeft, ChevronRight, MapPin, Users, Calendar, Maximize, Edit2, Image as ImageIcon, Save, Trash2, Upload } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'home', label: 'Басты бет' },
  { id: 'history', label: 'Аудан тарихы' },
  { id: 'monuments', label: 'Ескерткіштер' },
  { id: 'personalities', label: 'Тұлғалар' },
  { id: 'tourism', label: 'Туристік орындар' },
];

const DEFAULT_IMAGES = {
  hero: "https://picsum.photos/seed/baiganin-hero/1920/1080",
  quote: "https://picsum.photos/seed/baiganin-quote/1920/600",
  historyCover: "https://picsum.photos/seed/baiganin-history-bright/1920/800",
  carousel: [
    "https://picsum.photos/seed/baiganin1/1200/600",
    "https://picsum.photos/seed/baiganin2/1200/600",
    "https://picsum.photos/seed/baiganin3/1200/600",
    "https://picsum.photos/seed/baiganin4/1200/600"
  ],
  timeline: [
    "https://picsum.photos/seed/baiganin-1928/800/600",
    "https://picsum.photos/seed/baiganin-1941/800/600",
    "https://picsum.photos/seed/baiganin-1991/800/600",
    "https://picsum.photos/seed/baiganin-now/800/600"
  ]
};

const HISTORY_TIMELINE = [
  {
    year: "1928",
    title: "Ауданның іргетасы қаланды",
    description: "Байғанин ауданы ресми түрде құрылып, алғашқы ұжымдастыру жылдарында ауыл шаруашылығы, әсіресе мал шаруашылығы қарқынды дамыды. Орталығы — Қарауылкелді ауылы болып бекітілді."
  },
  {
    year: "1941",
    title: "Ерен еңбек пен ерлік",
    description: "Ұлы Отан соғысы жылдарында аудан халқы майданға үлкен үлес қосып, тылдағы ерен еңбегімен көзге түсті. Жүздеген жерлестеріміз майданда қаһармандық танытты."
  },
  {
    year: "1991",
    title: "Тәуелсіздік таңы",
    description: "Қазақстан тәуелсіздік алғаннан кейін Байғанин ауданы жаңа даму кезеңіне аяқ басты. Инфрақұрылым жаңартылып, жаңа мектептер мен ауруханалар, мәдениет ошақтары салынды."
  },
  {
    year: "2026",
    title: "Жаңару мен даму",
    description: "Бүгінгі таңда аудан экономикасының негізін мұнай-газ өндіру және ауыл шаруашылығы құрайды. Мәдениет пен спорт қарқынды дамып, жаңа заманға сай жаңғыруда."
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [images, setImages] = useState(DEFAULT_IMAGES);
  const [editingImage, setEditingImage] = useState<{ type: 'hero' | 'carousel' | 'quote' | 'historyCover' | 'timeline', index?: number } | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    });

    window.addEventListener('appinstalled', () => {
      setShowInstallBtn(false);
      setDeferredPrompt(null);
    });
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBtn(false);
    }
    setDeferredPrompt(null);
  };

  // Load images from localStorage on mount
  useEffect(() => {
    const savedImages = localStorage.getItem('baiganin_images');
    if (savedImages) {
      try {
        const parsed = JSON.parse(savedImages);
        setImages({ ...DEFAULT_IMAGES, ...parsed });
      } catch (e) {
        console.error("Failed to load images", e);
      }
    }
  }, []);

  // Save images to localStorage whenever they change
  const saveImages = (newImages: typeof DEFAULT_IMAGES) => {
    setImages(newImages);
    localStorage.setItem('baiganin_images', JSON.stringify(newImages));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % 4);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + 4) % 4);
  };

  useEffect(() => {
    if (!isEditMode) {
      const timer = setInterval(nextSlide, 5000);
      return () => clearInterval(timer);
    }
  }, [isEditMode]);

  const handleImageChange = (url: string) => {
    if (!editingImage) return;

    const newImages = { ...images };
    if (editingImage.type === 'hero') {
      newImages.hero = url;
    } else if (editingImage.type === 'quote') {
      newImages.quote = url;
    } else if (editingImage.type === 'historyCover') {
      newImages.historyCover = url;
    } else if (editingImage.type === 'carousel' && editingImage.index !== undefined) {
      newImages.carousel[editingImage.index] = url;
    } else if (editingImage.type === 'timeline' && editingImage.index !== undefined) {
      newImages.timeline[editingImage.index] = url;
    }
    saveImages(newImages);
    setEditingImage(null);
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleImageChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetImages = () => {
    if (window.confirm("Барлық суреттерді бастапқы қалпына келтіруді қалайсыз ба?")) {
      saveImages(DEFAULT_IMAGES);
    }
  };

  const CAROUSEL_DATA = [
    {
      title: "Құрылған жылы",
      value: "1928 жыл",
      icon: <Calendar className="w-8 h-8" />,
      image: images.carousel[0],
      description: "Байғанин ауданының іргетасы қаланған тарихи кезең."
    },
    {
      title: "Әкімшілік орталығы",
      value: "Қарауылкелді селосы",
      icon: <MapPin className="w-8 h-8" />,
      image: images.carousel[1],
      description: "Ауданның саяси және мәдени орталығы."
    },
    {
      title: "Жер көлемі",
      value: "61 000 шаршы км",
      icon: <Maximize className="w-8 h-8" />,
      image: images.carousel[2],
      description: "Ақтөбе облысындағы ең ірі аудандардың бірі."
    },
    {
      title: "Халық саны",
      value: "23 000 адам",
      icon: <Users className="w-8 h-8" />,
      image: images.carousel[3],
      description: "Ауданның демографиялық көрсеткіші."
    }
  ];

  return (
    <div className="min-h-screen bg-[#fdfcf8] text-[#1a1a1a] font-sans selection:bg-[#5A5A40] selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/5">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-display text-2xl tracking-tighter uppercase">Байғанин</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`text-sm uppercase tracking-widest font-medium transition-colors hover:text-[#5A5A40] ${
                  activeTab === item.id ? 'text-[#5A5A40] border-b-2 border-[#5A5A40]' : 'text-black/60'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden absolute top-20 left-0 right-0 bg-white border-b border-black/5 p-4 flex flex-col gap-4"
            >
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMenuOpen(false);
                  }}
                  className={`text-left text-lg font-medium ${
                    activeTab === item.id ? 'text-[#5A5A40]' : 'text-black/60'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <main className="pt-20">
        {activeTab === 'home' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            {/* Hero Section */}
            <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 z-0">
                <img
                  src={images.hero}
                  alt="Байғанин ауданы"
                  className="w-full h-full object-cover scale-105 brightness-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/20" />
              </div>
              
              {isEditMode && (
                <button
                  onClick={() => setEditingImage({ type: 'hero' })}
                  className="absolute top-8 right-8 z-20 p-4 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-all flex items-center gap-2"
                >
                  <Edit2 className="w-5 h-5" />
                  <span className="text-xs uppercase tracking-widest font-bold">Обложканы ауыстыру</span>
                </button>
              )}

              <div className="relative z-10 text-center px-4">
                <motion.h1
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 1 }}
                  className="font-display text-7xl md:text-9xl text-white uppercase tracking-tighter leading-none"
                >
                  Байғанин <br /> ауданы
                </motion.h1>
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.8, duration: 1 }}
                  className="h-1 w-32 bg-white mx-auto mt-8"
                />
              </div>
            </section>

            {/* Quote Section */}
            <section className="relative py-32 px-4 overflow-hidden">
              <div className="absolute inset-0 z-0">
                <img
                  src={images.quote}
                  alt="Quote Background"
                  className="w-full h-full object-cover brightness-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-white/90 backdrop-blur-[1px]" />
              </div>

              {isEditMode && (
                <button
                  onClick={() => setEditingImage({ type: 'quote' })}
                  className="absolute top-8 right-8 z-20 p-4 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-black/40 transition-all flex items-center gap-2"
                >
                  <Edit2 className="w-5 h-5" />
                  <span className="text-xs uppercase tracking-widest font-bold">Фонды ауыстыру</span>
                </button>
              )}

              <div className="relative z-10 max-w-4xl mx-auto text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  <span className="text-6xl font-serif text-[#5A5A40]/40 absolute -top-12 -left-4">"</span>
                  <p className="font-serif text-2xl md:text-4xl italic leading-relaxed text-[#5A5A40] drop-shadow-sm">
                    Туған елім - гүл елім, <br />
                    Қасиетіңді білемін. <br />
                    Өзіңе деп жүремін - <br />
                    Лүпілдеген жүрегім
                  </p>
                  <span className="text-6xl font-serif text-[#5A5A40]/40 absolute -bottom-12 -right-4">"</span>
                  <p className="mt-12 font-sans font-semibold uppercase tracking-[0.3em] text-[#1a1a1a]">
                    — Бәкір Тәжібаев
                  </p>
                </motion.div>
              </div>
            </section>

            {/* Carousel Section */}
            <section className="py-24 px-4 max-w-7xl mx-auto">
              <div className="relative h-[600px] rounded-3xl overflow-hidden shadow-2xl group">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0"
                  >
                    <img
                      src={CAROUSEL_DATA[currentSlide].image}
                      alt={CAROUSEL_DATA[currentSlide].title}
                      className="w-full h-full object-cover brightness-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    
                    {isEditMode && (
                      <button
                        onClick={() => setEditingImage({ type: 'carousel', index: currentSlide })}
                        className="absolute top-8 right-8 z-20 p-4 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-all flex items-center gap-2"
                      >
                        <Edit2 className="w-5 h-5" />
                        <span className="text-xs uppercase tracking-widest font-bold">Осы суретті ауыстыру</span>
                      </button>
                    )}

                    <div className="absolute bottom-0 left-0 p-8 md:p-16 text-white max-w-2xl">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                          {CAROUSEL_DATA[currentSlide].icon}
                        </div>
                        <span className="text-sm uppercase tracking-widest font-semibold text-white/80">
                          {CAROUSEL_DATA[currentSlide].title}
                        </span>
                      </div>
                      <h2 className="text-4xl md:text-6xl font-display uppercase mb-4">
                        {CAROUSEL_DATA[currentSlide].value}
                      </h2>
                      <p className="text-lg text-white/70 font-serif italic">
                        {CAROUSEL_DATA[currentSlide].description}
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Carousel Controls */}
                <div className="absolute top-1/2 -translate-y-1/2 left-4 right-4 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={prevSlide}
                    className="p-4 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="p-4 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>

                {/* Indicators */}
                <div className="absolute bottom-8 right-8 flex gap-2">
                  {CAROUSEL_DATA.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-1.5 transition-all duration-300 rounded-full ${
                        currentSlide === idx ? 'w-8 bg-white' : 'w-2 bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </section>
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            {/* Half-page Cover */}
            <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 z-0">
                <img
                  src={images.historyCover}
                  alt="Аудан тарихы"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
              </div>
              
              {isEditMode && (
                <button
                  onClick={() => setEditingImage({ type: 'historyCover' })}
                  className="absolute top-8 right-8 z-20 p-4 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-all flex items-center gap-2"
                >
                  <Edit2 className="w-5 h-5" />
                  <span className="text-xs uppercase tracking-widest font-bold">Обложканы ауыстыру</span>
                </button>
              )}

              <div className="relative z-10 text-center px-4">
                <motion.h1
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  className="font-display text-5xl md:text-7xl text-white uppercase tracking-tighter drop-shadow-lg"
                >
                  Аудан тарихы
                </motion.h1>
              </div>
            </section>

            {/* History Content - Bento Grid Style */}
            <section className="py-24 px-4 max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[250px] gap-4 md:gap-6">
                
                {/* Intro Card (Large) */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="col-span-1 md:col-span-2 row-span-2 bg-[#fdfcf8] rounded-3xl p-8 md:p-12 shadow-sm border border-black/5 flex flex-col justify-center"
                >
                  <h2 className="text-4xl md:text-5xl font-display uppercase text-[#1a1a1a] mb-6">Негізгі тарих</h2>
                  <p className="text-lg md:text-xl font-serif text-black/70 leading-relaxed">
                    Байғанин ауданы — Ақтөбе облысының оңтүстік-батысында орналасқан әкімшілік бөлініс. Бұл өңір ерте заманнан бері көшпелі қазақ тайпаларының қонысы болған. Ұлы Жібек жолының бір тармағы осы аудан аумағымен өтіп, сауда мен мәдениеттің дамуына үлес қосқан.
                  </p>
                </motion.div>

                {/* Year Card (Small, Accent) */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, delay: 0.1 }}
                  className="col-span-1 row-span-1 bg-[#5A5A40] rounded-3xl p-8 text-white flex flex-col justify-center items-center text-center shadow-sm"
                >
                  <span className="text-6xl md:text-7xl font-display mb-2">1928</span>
                  <span className="text-sm uppercase tracking-widest opacity-80 font-medium">Құрылған жылы</span>
                </motion.div>

                {/* Image Card 1 (Tall) */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, delay: 0.2 }}
                  className="col-span-1 row-span-2 rounded-3xl overflow-hidden relative group shadow-sm"
                >
                  <img 
                    src={images.timeline[0]} 
                    alt="Тарихи сурет"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <span className="text-white font-serif text-lg">Кеңес дәуірі</span>
                  </div>
                  {isEditMode && (
                     <button
                       onClick={() => setEditingImage({ type: 'timeline', index: 0 })}
                       className="absolute top-4 right-4 z-20 p-3 bg-white/80 backdrop-blur-md rounded-full text-black hover:bg-white transition-all flex items-center gap-2"
                     >
                       <Edit2 className="w-4 h-4" />
                     </button>
                   )}
                </motion.div>

                {/* Area Stat Card (Small) */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, delay: 0.3 }}
                  className="col-span-1 row-span-1 bg-stone-200 rounded-3xl p-8 flex flex-col justify-center items-center text-center shadow-sm"
                >
                  <span className="text-5xl md:text-6xl font-display text-[#1a1a1a] mb-2">61<span className="text-3xl">мың</span></span>
                  <span className="text-xs uppercase tracking-widest text-black/50 font-bold">Шаршы шақырым аумақ</span>
                </motion.div>

                {/* Soviet Era Card (Wide) */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, delay: 0.4 }}
                  className="col-span-1 md:col-span-2 row-span-1 bg-white rounded-3xl p-8 shadow-sm border border-black/5 flex flex-col justify-center"
                >
                  <h3 className="text-2xl font-display uppercase text-[#5A5A40] mb-3">Ерен еңбек пен ерлік</h3>
                  <p className="font-serif text-black/70 leading-relaxed">
                    Алғашқы ұжымдастыру жылдарында ауыл шаруашылығы қарқынды дамыды. Ұлы Отан соғысы жылдарында аудан халқы майданға үлкен үлес қосып, тылдағы ерен еңбегімен көзге түсті.
                  </p>
                </motion.div>

                {/* Image Card 2 (Wide) */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, delay: 0.5 }}
                  className="col-span-1 md:col-span-2 row-span-1 rounded-3xl overflow-hidden relative group shadow-sm"
                >
                  <img 
                    src={images.timeline[3]} 
                    alt="Қазіргі заман"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                  <div className="absolute bottom-6 left-6">
                    <span className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider text-[#1a1a1a]">Бүгінгі таңда</span>
                  </div>
                  {isEditMode && (
                     <button
                       onClick={() => setEditingImage({ type: 'timeline', index: 3 })}
                       className="absolute top-4 right-4 z-20 p-3 bg-white/80 backdrop-blur-md rounded-full text-black hover:bg-white transition-all flex items-center gap-2"
                     >
                       <Edit2 className="w-4 h-4" />
                     </button>
                   )}
                </motion.div>

                {/* Independence Card (Wide) */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, delay: 0.6 }}
                  className="col-span-1 md:col-span-2 row-span-1 bg-[#1a1a1a] rounded-3xl p-8 text-white shadow-sm flex flex-col justify-center"
                >
                  <h3 className="text-2xl font-display uppercase text-[#fdfcf8] mb-3">Тәуелсіздік таңы</h3>
                  <p className="font-serif text-white/70 leading-relaxed">
                    Қазақстан тәуелсіздік алғаннан кейін инфрақұрылым жаңартылып, жаңа мектептер мен ауруханалар салынды. Экономиканың негізін мұнай-газ өндіру және ауыл шаруашылығы құрайды.
                  </p>
                </motion.div>

              </div>
            </section>
          </motion.div>
        )}

        {!['home', 'history'].includes(activeTab) && (
          <div className="max-w-7xl mx-auto px-4 py-24 text-center">
            <h2 className="text-4xl font-display uppercase text-[#5A5A40]">
              {NAV_ITEMS.find(i => i.id === activeTab)?.label}
            </h2>
            <p className="mt-8 text-xl font-serif italic text-black/60">
              Бұл бөлім жақын арада толықтырылады...
            </p>
          </div>
        )}
      </main>

      {/* Edit Mode Toggle */}
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-4">
        {isEditMode && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={resetImages}
            className="p-4 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-all flex items-center gap-2 group"
            title="Бастапқы қалпына келтіру"
          >
            <Trash2 className="w-6 h-6" />
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 text-xs uppercase tracking-widest font-bold whitespace-nowrap">Тазалау</span>
          </motion.button>
        )}
        <button
          onClick={() => setIsEditMode(!isEditMode)}
          className={`p-4 rounded-full shadow-lg transition-all flex items-center gap-2 group ${
            isEditMode ? 'bg-[#5A5A40] text-white' : 'bg-white text-[#1a1a1a]'
          }`}
        >
          {isEditMode ? <Save className="w-6 h-6" /> : <Edit2 className="w-6 h-6" />}
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 text-xs uppercase tracking-widest font-bold whitespace-nowrap">
            {isEditMode ? 'Сақтау' : 'Өңдеу'}
          </span>
        </button>
      </div>

      {/* Image Edit Modal */}
      <AnimatePresence>
        {editingImage && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingImage(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-2xl font-display uppercase mb-6">Суретті ауыстыру</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold text-black/40 mb-2">Компьютерден жүктеу</label>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-4 border-2 border-dashed border-black/10 rounded-2xl flex flex-col items-center gap-2 hover:border-[#5A5A40] hover:bg-[#5A5A40]/5 transition-all"
                  >
                    <Upload className="w-8 h-8 text-[#5A5A40]" />
                    <span className="text-sm font-medium">Файлды таңдаңыз</span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-black/5"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold text-black/20">
                    <span className="bg-white px-2">немесе сілтеме қойыңыз</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold text-black/40 mb-2">Сурет сілтемесі (URL)</label>
                  <input
                    type="text"
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-3 bg-[#f5f5f0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleImageChange((e.target as HTMLInputElement).value);
                    }}
                  />
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <button
                  onClick={() => setEditingImage(null)}
                  className="flex-1 py-3 text-xs uppercase tracking-widest font-bold text-black/40 hover:text-black transition-colors"
                >
                  Болдырмау
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-[#151619] text-white py-16 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <span className="font-display text-3xl uppercase tracking-tighter">Байғанин</span>
            <p className="mt-2 text-white/40 text-sm tracking-widest uppercase">Ақтөбе облысы</p>
          </div>
          <div className="flex gap-8">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="text-xs uppercase tracking-[0.2em] text-white/60 hover:text-white transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="text-white/40 text-xs uppercase tracking-widest">
            © 2026 Байғанин ауданы. Барлық құқықтар қорғалған.
          </div>
        </div>
      </footer>

      {/* PWA Install Button */}
      {showInstallBtn && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={handleInstallClick}
          className="fixed bottom-8 right-8 z-[100] bg-[#5A5A40] text-white p-4 rounded-full shadow-2xl flex items-center gap-2 hover:bg-[#4a4a30] transition-all"
        >
          <Upload className="w-5 h-5" />
          <span className="font-sans text-xs font-bold uppercase tracking-widest pr-2">Орнату</span>
        </motion.button>
      )}
    </div>
  );
}
