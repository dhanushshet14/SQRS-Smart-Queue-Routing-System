import * as React from 'react'
import { motion } from 'framer-motion'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sphere, MeshDistortMaterial, Float } from '@react-three/drei'
import { Activity, Brain, Zap, Users, BarChart3, Shield } from 'lucide-react'

const AnimatedSphere = () => {
  return (
    <Float speed={1.4} rotationIntensity={1} floatIntensity={2}>
      <Sphere args={[1, 100, 200]} scale={2.4}>
        <MeshDistortMaterial
          color="#ff7849"
          attach="material"
          distort={0.3}
          speed={1.5}
          roughness={0}
        />
      </Sphere>
    </Float>
  )
}

const FeatureCard = ({ icon: Icon, title, description, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 group"
  >
    <div className="w-16 h-16 bg-warm-gradient rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
      <Icon className="w-8 h-8 text-white" />
    </div>
    <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
    <p className="text-white/80 leading-relaxed">{description}</p>
  </motion.div>
)

interface LandingPageProps {
  onGetStarted: () => void
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-warm-gradient overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* 3D Background */}
        <div className="absolute inset-0 opacity-30">
          <Canvas>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <AnimatedSphere />
            <OrbitControls enableZoom={false} enablePan={false} />
          </Canvas>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center animate-glow">
                <Activity className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 leading-tight">
              AI Smart Queue
              <span className="block bg-gradient-to-r from-warm-orange to-warm-pink bg-clip-text text-transparent">
                Routing System
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed">
              Revolutionary AI-powered customer-agent matching that optimizes call center operations 
              with intelligent routing scores and real-time analytics.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <button
              onClick={onGetStarted}
              className="px-12 py-4 bg-white text-warm-purple font-bold text-lg rounded-2xl hover:bg-white/90 transform hover:scale-105 transition-all duration-300 shadow-2xl"
            >
              Get Started
            </button>
            <button className="px-12 py-4 bg-white/20 backdrop-blur-md text-white font-bold text-lg rounded-2xl border border-white/30 hover:bg-white/30 transition-all duration-300">
              Watch Demo
            </button>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-20 left-20 w-4 h-4 bg-warm-orange rounded-full opacity-60"
        />
        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 3, repeat: Infinity, delay: 1 }}
          className="absolute top-40 right-32 w-6 h-6 bg-warm-pink rounded-full opacity-40"
        />
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 5, repeat: Infinity, delay: 2 }}
          className="absolute bottom-40 left-32 w-5 h-5 bg-warm-teal rounded-full opacity-50"
        />
      </section>

      {/* Features Section */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Intelligent Features
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Powered by advanced machine learning algorithms and real-time analytics
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={Brain}
              title="AI-Powered Matching"
              description="Advanced machine learning algorithms predict success probability between customers and agents with 75%+ accuracy."
              delay={0.1}
            />
            <FeatureCard
              icon={Zap}
              title="Real-Time Routing"
              description="Instant customer-agent matching with sub-200ms response times and dynamic queue management."
              delay={0.2}
            />
            <FeatureCard
              icon={Users}
              title="Smart Agent Pool"
              description="Intelligent agent management considering skills, experience, workload, and availability status."
              delay={0.3}
            />
            <FeatureCard
              icon={BarChart3}
              title="Advanced Analytics"
              description="Comprehensive performance metrics, routing score visualization, and success rate tracking."
              delay={0.4}
            />
            <FeatureCard
              icon={Shield}
              title="Enterprise Security"
              description="Bank-level security with JWT authentication, data encryption, and compliance standards."
              delay={0.5}
            />
            <FeatureCard
              icon={Activity}
              title="Live Dashboard"
              description="Beautiful real-time dashboard with 3D visualizations, warm gradients, and smooth animations."
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white/10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="text-5xl font-bold text-white mb-2">75%+</div>
              <div className="text-white/80">Routing Accuracy</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="text-5xl font-bold text-white mb-2">&lt;200ms</div>
              <div className="text-white/80">Response Time</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="text-5xl font-bold text-white mb-2">24/7</div>
              <div className="text-white/80">Availability</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="text-5xl font-bold text-white mb-2">∞</div>
              <div className="text-white/80">Scalability</div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default LandingPage