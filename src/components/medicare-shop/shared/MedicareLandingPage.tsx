"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Clock, Star, ArrowRight, CheckCircle, Phone } from "lucide-react";
import { motion } from "framer-motion";

interface LandingPageProps {
  title: string;
  subtitle: string;
  onStartGuided: () => void;
  onStartQuick: () => void;
  testimonials?: Array<{
    name: string;
    quote: string;
    rating: number;
  }>;
  features?: Array<{
    icon: React.ReactNode;
    title: string;
    description: string;
  }>;
  benefits?: string[];
}

const defaultFeatures = [
  {
    icon: <Shield className="w-8 h-8 text-primary" />,
    title: "Licensed Agents",
    description: "Get expert guidance from certified insurance professionals"
  },
  {
    icon: <Users className="w-8 h-8 text-primary" />,
    title: "Top Carriers",
    description: "Compare plans from leading insurance companies nationwide"
  },
  {
    icon: <Clock className="w-8 h-8 text-primary" />,
    title: "Instant Quotes",
    description: "Get real-time pricing and coverage details in seconds"
  }
];

const defaultTestimonials = [
  {
    name: "Sarah M.",
    quote: "Found the perfect plan in minutes. The process was so simple!",
    rating: 5
  },
  {
    name: "Robert K.",
    quote: "Saved over $200/month compared to my old plan. Highly recommend!",
    rating: 5
  },
  {
    name: "Linda T.",
    quote: "The support team helped me understand all my options clearly.",
    rating: 5
  }
];

const defaultBenefits = [
  "100% Free to Use",
  "No Hidden Fees",
  "Instant Results",
  "Licensed Agents",
  "Top Rated Carriers"
];

export default function MedicareLandingPage({
  title,
  subtitle,
  onStartGuided,
  onStartQuick,
  testimonials = defaultTestimonials,
  features = defaultFeatures,
  benefits = defaultBenefits
}: LandingPageProps) {
  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen flex items-center">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              {title}
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              {subtitle}
            </p>
            
            {/* Benefits Pills */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {benefits.map((benefit, index) => (
                <Badge key={index} variant="secondary" className="px-4 py-2 text-sm">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {benefit}
                </Badge>
              ))}
            </div>
          </motion.div>
        </div>

        {/* CTA Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-16 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="h-full border-2 border-primary/20 hover:border-primary/40 transition-colors">
              <CardContent className="p-8 text-center h-full flex flex-col justify-between">
                <div>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Guided Experience</h3>
                  <p className="text-gray-600 mb-6">
                    Let our smart questionnaire guide you through the process step-by-step. 
                    Perfect if you're new to Medicare or want personalized recommendations.
                  </p>
                </div>
                <Button 
                  size="lg" 
                  onClick={onStartGuided}
                  className="w-full"
                >
                  Start Guided Flow
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="h-full border-2 border-blue-200 hover:border-blue-300 transition-colors">
              <CardContent className="p-8 text-center h-full flex flex-col justify-between">
                <div>
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Quick Quotes</h3>
                  <p className="text-gray-600 mb-6">
                    Already know what you want? Jump straight to quotes with just 
                    your ZIP code and basic info. Get results in under 2 minutes.
                  </p>
                </div>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={onStartQuick}
                  className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  Get Quick Quotes
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center mx-auto mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl font-bold mb-4">What Our Customers Say</h2>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1 + index * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-600 mb-4">"{testimonial.quote}"</p>
                    <p className="font-semibold">— {testimonial.name}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="text-center mt-16 bg-white rounded-2xl p-8 shadow-lg"
        >
          <h3 className="text-2xl font-bold mb-4">Need Help Getting Started?</h3>
          <p className="text-gray-600 mb-6">
            Our licensed Medicare specialists are here to help you understand your options
          </p>
          <Button size="lg" variant="outline">
            <Phone className="w-5 h-5 mr-2" />
            Speak with a Specialist
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
