import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Target, Heart, Clock, MessageCircle, Share2, CheckCircle } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-6">
            Mentor-Mentee Program
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Empowering growth through meaningful connections and guided development
          </p>
        </div>

        {/* Handbook Section */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 flex items-center justify-center gap-3">
              <BookOpen className="h-8 w-8 text-primary" />
              Handbook for Mentees
            </h2>
            <p className="text-muted-foreground text-lg">
              Throughout history there have been countless mentor-mentee relationships in every conceivable discipline. 
              From philosophy to politics to psychiatry to the arts, mentoring has always played an important role. 
              Socrates mentored Plato. Hubert Humphrey mentored Walter Mondale. Sigmund Freud mentored C. G. Jung. 
              Ralph Waldo Emerson mentored Henry David Thoreau.
            </p>
          </div>

          {/* The Zen Master Story */}
          <Card className="mb-12 border-primary/20 bg-gradient-to-br from-card to-card/50">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-primary">
                The Zen Master and the Bird
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray dark:prose-invert max-w-none">
              <div className="text-muted-foreground leading-relaxed space-y-4">
                <p>
                  Once upon a time in a village there were 2 small mischievous boys (as small boys ought to be!) 
                  These two boys while being affectionate were usually up to playing pranks on everyone.
                </p>
                <p>
                  One day, they heard that the Zen Master was coming to stay in their village for a few days. 
                  They were dismayed because it meant that they would have to attend his talks, as their parents 
                  would want them to accompany them. They had heard that the Zen Master was all knowing and all 
                  seeing and they decided to play a prank on him.
                </p>
                <p>
                  The two boys devised a plan wherein they would catch a bird and hide it in the cupped hands of 
                  one of the boys. They would then ask the Zen Master if he thought that the bird was alive or dead. 
                  If the Master said that the bird was alive, they would kill it and if he said that the bird was 
                  dead they would open their hands and let the bird fly away, thereby proving the Master wrong. 
                  They were extremely excited about this prank and were sure of its success.
                </p>
                <p>
                  Finally the day came when the Master came to the village. The boys ran up to him with the bird 
                  cupped in the hands of one of them. They asked him "Master, Master what do you think we have in 
                  our hands?" The Master said, "I do not know. Tell me." The boys said, "We have a bird in our hands 
                  but we want you to tell us, if it is alive or dead!"
                </p>
                <p>
                  The Zen Master looked at the boys for one long moment and then smiled a sweet smile. He said, 
                  "Son, it is in your hands."
                </p>
                <div className="bg-primary/10 p-6 rounded-lg mt-6">
                  <p className="text-primary font-semibold text-lg text-center">
                    Similarly what you want to get out of the Mentoring Program is in your hands. 
                    It is up to you to get the maximum out of it.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* History Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-3">
                <Users className="h-6 w-6 text-primary" />
                Mentoring - A Brief History and Introduction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Throughout history there have been countless mentor-mentee relationships in every conceivable discipline. 
                From philosophy to politics to psychiatry to the arts, mentoring has always played an important role. 
                Socrates mentored Plato. Hubert Humphrey mentored Walter Mondale. Sigmund Freud mentored C. G. Jung. 
                Ralph Waldo Emerson mentored Henry David Thoreau.
              </p>
              <p>
                The story of Mentor comes from Homer's epic poem The Odyssey. When Odysseus, King of Ithaca went 
                to fight in the Trojan War, he entrusted the care of his kingdom to Mentor. Mentor served as the 
                teacher and overseer of Odysseus's son, Telemachus.
              </p>
              <p>
                After the war, Odysseus was condemned to wander vainly for ten years in his attempt to reach home. 
                Telemachus, now grown, went in search of his father. Athena, goddess of war and patroness of the arts 
                and industry accompanied him on his quest. At this time Athena assumed the form of Mentor. Eventually, 
                father and son were reunited. In time, the word mentor came to mean trusted advisor, friend, teacher 
                and wise person.
              </p>
              <div className="bg-accent/10 p-4 rounded-lg">
                <p className="font-semibold text-foreground">
                  A mentor is an individual, usually older, always more experienced, who helps and guides another 
                  individual's development. This guidance is not done for personal gain.
                </p>
              </div>
              <p className="text-sm italic text-muted-foreground/80">
                One of the most valuable assets your career can have is a good mentor.
              </p>
            </CardContent>
          </Card>

          {/* What is a Mentee */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-3">
                <Target className="h-6 w-6 text-primary" />
                What is a Mentee?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed mb-6">
                A mentee is a self-motivated individual seeking to continuously promote personal development. 
                A mentee recognizes personal strengths and weaknesses and actively seeks methods for personal growth.
              </p>
              
              <h4 className="font-semibold text-foreground mb-4">Key Behaviors of a Mentee</h4>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="border-l-4 border-primary pl-4">
                    <h5 className="font-semibold text-foreground mb-2">Eager to Learn</h5>
                    <p className="text-sm text-muted-foreground">
                      A mentee has a strong desire to learn new skills and abilities, or develop existing ones. 
                      Seeks educational opportunities to broaden capabilities and gain mastery.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-primary pl-4">
                    <h5 className="font-semibold text-foreground mb-2">Team Player</h5>
                    <p className="text-sm text-muted-foreground mb-3">
                      Must cooperate and communicate with others. Should:
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li>• Initiate and participate in discussions</li>
                      <li>• Seek information and opinions</li>
                      <li>• Suggest plans for reaching goals</li>
                      <li>• Clarify or elaborate on ideas</li>
                      <li>• Resolve differences</li>
                      <li>• Accept praise and criticism</li>
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="border-l-4 border-accent pl-4">
                    <h5 className="font-semibold text-foreground mb-2">Patient</h5>
                    <p className="text-sm text-muted-foreground">
                      Must be willing to put time and effort into the relationship. Persevere through difficulties 
                      and be realistic that career advancement doesn't happen overnight.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-accent pl-4">
                    <h5 className="font-semibold text-foreground mb-2">Risk Taker</h5>
                    <p className="text-sm text-muted-foreground">
                      Must move beyond mastered tasks and accept new, challenging experiences. 
                      Be willing to take chances for professional growth!
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-accent pl-4">
                    <h5 className="font-semibold text-foreground mb-2">Positive Attitude</h5>
                    <p className="text-sm text-muted-foreground">
                      The most important trait! A bright and hopeful attitude helps succeed. 
                      Don't be afraid to fail - it's part of learning.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benefits and Expectations */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  Benefits to the Mentee
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-1">•</Badge>
                    Career direction and advice
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-1">•</Badge>
                    Connect with development needs for success
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-1">•</Badge>
                    Networking opportunities
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-1">•</Badge>
                    Access to senior leaders
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-1">•</Badge>
                    Exposure to the larger organization
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-1">•</Badge>
                    Learn from experienced professionals
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-1">•</Badge>
                    Confidential support and guidance
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-3">
                  <Target className="h-6 w-6 text-primary" />
                  Expectations from the Mentee
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Badge variant="secondary" className="mt-1">•</Badge>
                    Take initiative in career development
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge variant="secondary" className="mt-1">•</Badge>
                    Develop clear mentoring agreements
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge variant="secondary" className="mt-1">•</Badge>
                    Keep supervisor informed of progress
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge variant="secondary" className="mt-1">•</Badge>
                    Attend training and forums
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge variant="secondary" className="mt-1">•</Badge>
                    Participate in honest discussions
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge variant="secondary" className="mt-1">•</Badge>
                    Meet ~4 hours monthly with mentor
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge variant="secondary" className="mt-1">•</Badge>
                    Provide feedback on partnership effectiveness
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Mentor Roles */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-3">
                <Heart className="h-6 w-6 text-primary" />
                Role of the Mentor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed mb-6">
                The role of the mentor is to be an advisor, guide and friend to the mentee. Mentors assist in 
                identifying growth areas, provide training, navigate the organization, and protect and promote the mentee.
              </p>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-primary/5 p-4 rounded-lg">
                  <h5 className="font-semibold text-primary mb-2">Coach/Advisor</h5>
                  <p className="text-sm text-muted-foreground">
                    Give advice, share ideas, provide feedback, and share "unwritten rules for success"
                  </p>
                </div>
                
                <div className="bg-accent/5 p-4 rounded-lg">
                  <h5 className="font-semibold text-accent-foreground mb-2">Support System</h5>
                  <p className="text-sm text-muted-foreground">
                    Act as sounding board for ideas/concerns and provide insights into opportunities
                  </p>
                </div>
                
                <div className="bg-secondary/5 p-4 rounded-lg">
                  <h5 className="font-semibold text-secondary-foreground mb-2">Resource Person</h5>
                  <p className="text-sm text-muted-foreground">
                    Identify resources for development and expand network of contacts
                  </p>
                </div>
                
                <div className="bg-primary/5 p-4 rounded-lg">
                  <h5 className="font-semibold text-primary mb-2">Champion</h5>
                  <p className="text-sm text-muted-foreground">
                    Serve as advocate and seek opportunities for increased visibility
                  </p>
                </div>
                
                <div className="bg-accent/5 p-4 rounded-lg">
                  <h5 className="font-semibold text-accent-foreground mb-2">Devil's Advocate</h5>
                  <p className="text-sm text-muted-foreground">
                    Challenge thinking to help mentee make better decisions and strategies
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Four Stages */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-3">
                <Clock className="h-6 w-6 text-primary" />
                The Four Stages of Mentoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed mb-6">
                A solid mentor-mentee relationship is rooted in trust. The four chief ingredients are: 
                <span className="font-semibold text-foreground"> Trust, Time, Dialogue, and Sharing</span>
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-lg border-l-4 border-primary">
                    <h5 className="font-semibold text-primary mb-2">Stage I</h5>
                    <p className="text-sm font-medium text-foreground">Building the Relationship</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-accent/10 to-accent/5 p-4 rounded-lg border-l-4 border-accent">
                    <h5 className="font-semibold text-accent-foreground mb-2">Stage II</h5>
                    <p className="text-sm font-medium text-foreground">Exchanging Information & Setting Goals</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-secondary/10 to-secondary/5 p-4 rounded-lg border-l-4 border-secondary">
                    <h5 className="font-semibold text-secondary-foreground mb-2">Stage III</h5>
                    <p className="text-sm font-medium text-foreground">Working Towards Goals/Deepening Engagement</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-muted/10 to-muted/5 p-4 rounded-lg border-l-4 border-muted">
                    <h5 className="font-semibold text-muted-foreground mb-2">Stage IV</h5>
                    <p className="text-sm font-medium text-foreground">Ending Formal Relationship & Planning Future</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Etiquette */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-3">
                <MessageCircle className="h-6 w-6 text-primary" />
                The Etiquette of Mentoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed mb-6">
                There is an unspoken code of behavior in mentoring relationships. Following proper etiquette 
                ensures a successful and respectful partnership.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-50 dark:bg-green-950/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
                  <h5 className="font-semibold text-green-700 dark:text-green-400 mb-4 text-lg">DO</h5>
                  <ul className="space-y-3 text-green-700 dark:text-green-300">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-1 flex-shrink-0" />
                      Respect your mentor's time as much as your own
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-1 flex-shrink-0" />
                      Be explicit about meeting norms and your needs
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-1 flex-shrink-0" />
                      Express appreciation for any help given
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-1 flex-shrink-0" />
                      Keep the relationship professional
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-1 flex-shrink-0" />
                      Work through conflicts respectfully
                    </li>
                  </ul>
                </div>
                
                <div className="bg-red-50 dark:bg-red-950/20 p-6 rounded-lg border border-red-200 dark:border-red-800">
                  <h5 className="font-semibold text-red-700 dark:text-red-400 mb-4 text-lg">DON'T</h5>
                  <ul className="space-y-3 text-red-700 dark:text-red-300">
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">✕</span>
                      Assume your schedule always has priority
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">✕</span>
                      Make your mentor guess meeting ground rules
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">✕</span>
                      Expect solutions to be handed out
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">✕</span>
                      Take your mentor for granted
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">✕</span>
                      End the relationship on a sour note
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <Card className="bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 border-primary/20">
            <CardContent className="text-center py-12">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Ready to Begin Your Mentoring Journey?
              </h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Remember, like the bird in the Zen Master's story, your success in the mentoring program 
                is in your hands. Take the initiative, be proactive, and make the most of this opportunity.
              </p>
              
              <div className="mb-6">
                <p className="text-lg font-semibold text-foreground">Rangarajan Raghavachari</p>
                <p className="text-muted-foreground">The Chief Executive Officer (CEO) JKKN INSTITUTIONS</p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-4">
                <Badge variant="secondary" className="px-4 py-2">Trust</Badge>
                <Badge variant="secondary" className="px-4 py-2">Time</Badge>
                <Badge variant="secondary" className="px-4 py-2">Dialogue</Badge>
                <Badge variant="secondary" className="px-4 py-2">Sharing</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Landing;