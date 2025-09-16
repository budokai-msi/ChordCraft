import { Brain, Zap, User, Settings } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface HeaderProps {
  onShowSubscription: () => void;
}

export function Header({ onShowSubscription }: HeaderProps) {
  return (
    <header className="h-16 border-b border-purple-800/30 bg-black/20 backdrop-blur-sm px-6 flex items-center justify-between">
      {/* Logo and Branding */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            ChordCraft Studio
          </h1>
        </div>
        
        <div className="flex gap-2">
          <Badge variant="secondary" className="bg-purple-600/20 text-purple-300 border-purple-500/30">
            <Zap className="w-3 h-3 mr-1" />
            AI-Powered
          </Badge>
          <Badge variant="outline" className="bg-gradient-to-r from-yellow-400/10 to-yellow-600/10 text-yellow-400 border-yellow-500/30">
            PRO User
          </Badge>
        </div>
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onShowSubscription}
          className="bg-gradient-to-r from-purple-600 to-pink-600 border-none text-white hover:from-purple-700 hover:to-pink-700"
        >
          Upgrade to PRO
        </Button>
        
        <Button variant="ghost" size="sm">
          <Settings className="w-4 h-4" />
        </Button>
        
        <Avatar className="w-8 h-8">
          <AvatarImage src="https://images.unsplash.com/photo-1661261400335-7dc71eb2b5a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMHN0dWRpbyUyMHByb2R1Y2VyfGVufDF8fHx8MTc1ODAwNDU5Nnww&ixlib=rb-4.1.0&q=80&w=32&utm_source=figma&utm_medium=referral" />
          <AvatarFallback className="bg-purple-600">
            <User className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}