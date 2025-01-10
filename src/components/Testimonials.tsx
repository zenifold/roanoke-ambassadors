import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Tech Entrepreneur",
    image: "/placeholder.svg",
    quote: "Being an ambassador has allowed me to connect with like-minded professionals and make a real impact in our community.",
  },
  {
    name: "Michael Chen",
    role: "Community Leader",
    image: "/placeholder.svg",
    quote: "The program provides an incredible platform to showcase what makes Roanoke special and attract top talent to our region.",
  },
  {
    name: "Emily Rodriguez",
    role: "Healthcare Professional",
    image: "/placeholder.svg",
    quote: "I've met amazing people and helped shape initiatives that make our region even better for young professionals.",
  },
];

export const Testimonials = () => {
  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-primary">
          Hear from Our Ambassadors
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={testimonial.image} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="ml-4">
                    <h3 className="font-semibold text-lg">{testimonial.name}</h3>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">&ldquo;{testimonial.quote}&rdquo;</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};