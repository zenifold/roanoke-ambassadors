import { Hero } from "@/components/Hero";
import { Testimonials } from "@/components/Testimonials";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Calendar, Target } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-primary">
            Why Become an Ambassador?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <Users className="h-12 w-12 mx-auto mb-4 text-secondary" />
              <h3 className="text-xl font-semibold mb-3">Connect</h3>
              <p className="text-gray-600">
                Network with diverse professionals and build meaningful relationships
              </p>
            </div>
            <div className="p-6">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-secondary" />
              <h3 className="text-xl font-semibold mb-3">Engage</h3>
              <p className="text-gray-600">
                Participate in exclusive events and shape community initiatives
              </p>
            </div>
            <div className="p-6">
              <Target className="h-12 w-12 mx-auto mb-4 text-secondary" />
              <h3 className="text-xl font-semibold mb-3">Impact</h3>
              <p className="text-gray-600">
                Make a lasting difference in the Roanoke Region's growth
              </p>
            </div>
          </div>
        </div>
      </section>

      <Testimonials />

      <section className="py-20 px-4 bg-primary text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-lg mb-8">
            Join the Roanoke Region Talent Ambassadors program and be part of something bigger.
          </p>
          <Button size="lg" className="bg-secondary hover:bg-secondary/90">
            Apply Now <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;