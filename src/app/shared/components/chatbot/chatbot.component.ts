import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { environment } from '@env/environment';

interface ChatMessage {
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface QuickAction {
  text: string;
  icon: string;
  action: string;
}

@Component({
  selector: 'clark-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss']
})
export class ChatbotComponent implements OnInit {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;

  isChatOpen = false;
  isTyping = false;
  currentMessage = '';
  messages: ChatMessage[] = [];

  quickActions: QuickAction[] = [
    {
      text: 'Browse Curriculum',
      icon: 'fas fa-search',
      action: 'browse'
    },
    {
      text: 'How to Contribute',
      icon: 'fas fa-plus-circle',
      action: 'contribute'
    },
    {
      text: 'Get Help',
      icon: 'fas fa-question-circle',
      action: 'help'
    },
    {
      text: 'About CLARK',
      icon: 'fas fa-info-circle',
      action: 'about'
    }
  ];

  // Check if chatbot is enabled
  get isChatbotEnabled(): boolean {
    return environment.enableChatbot;
  }

  ngOnInit() {
    // Initialize with welcome message
    if (this.isChatbotEnabled) {
      this.addBotMessage(
        `👋 Hi! I'm CLARK, your cybersecurity education assistant. I'm here to help you navigate our platform, find curriculum, and answer questions about cybersecurity education. How can I help you today?`
      );
    }
  }

  toggleChat() {
    this.isChatOpen = !this.isChatOpen;

    if (this.isChatOpen) {
      // Focus input when chat opens
      setTimeout(() => {
        if (this.messageInput) {
          this.messageInput.nativeElement.focus();
        }
      }, 300);
    }
  }

  closeChatOnOverlay(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.toggleChat();
    }
  }

  sendMessage() {
    if (!this.currentMessage.trim()) {
return;
}

    const userMessage = this.currentMessage.trim();
    this.addUserMessage(userMessage);
    this.currentMessage = '';

    // Simulate typing and generate response
    this.isTyping = true;
    setTimeout(() => {
      this.isTyping = false;
      this.generateBotResponse(userMessage);
    }, 1500);
  }

  sendQuickAction(action: QuickAction) {
    this.addUserMessage(action.text);

    this.isTyping = true;
    setTimeout(() => {
      this.isTyping = false;
      this.handleQuickAction(action.action);
    }, 1000);
  }

  private addUserMessage(text: string) {
    this.messages.push({
      text,
      sender: 'user',
      timestamp: new Date()
    });
    this.scrollToBottom();
  }

  private addBotMessage(text: string) {
    this.messages.push({
      text,
      sender: 'bot',
      timestamp: new Date()
    });
    this.scrollToBottom();
  }

  private handleQuickAction(action: string) {
    switch (action) {
      case 'browse':
        this.addBotMessage(
          `Great! You can browse our curriculum by clicking on "Browse" in the navigation menu or visiting our <a href="/browse" target="_blank">Browse page</a>. Our curriculum covers various cybersecurity topics from basic concepts to advanced techniques. You can filter by academic level, topic, or learning object type to find exactly what you need.`
        );
        break;
      case 'contribute':
        this.addBotMessage(
          `Wonderful! CLARK welcomes contributions from cybersecurity educators. You can contribute by:<br><br>
          • Creating new learning objects through our <a href="/onion/dashboard" target="_blank">Dashboard</a><br>
          • Sharing existing materials under our CC BY-NC-SA 4.0 license<br>
          • Participating in our review process<br><br>
          Visit our <a href="/contribute-page" target="_blank">Contributors page</a> for detailed guidelines and resources.`
        );
        break;
      case 'help':
        this.addBotMessage(
          `I'm here to help! You can:<br><br>
          • Contact our support team at <a href="mailto:info@secured.team">info@secured.team</a><br>
          • Visit our <a href="http://help.clark.center" target="_blank">Help Center</a><br>
          • Check our <a href="/about-us" target="_blank">About Us</a> page<br>
          • Browse our <a href="/editorial-process" target="_blank">Editorial Process</a><br><br>
          What specific question do you have? I can help with platform navigation, curriculum discovery, or general information about CLARK.`
        );
        break;
      case 'about':
        this.addBotMessage(
          `CLARK (Cybersecurity Labs and Resource Knowledge-base) is the largest platform providing <strong>free cybersecurity curriculum</strong> for educators worldwide. We're supported by leading institutions and provide high-quality, peer-reviewed educational resources.<br><br>
          Key features:<br>
          • ${Math.floor(Math.random() * 500 + 2000)}+ learning objects<br>
          • Peer-reviewed content<br>
          • Free and open access<br>
          • Multiple academic levels<br>
          • Diverse cybersecurity topics<br><br>
          Learn more on our <a href="/about-us" target="_blank">About page</a>!`
        );
        break;
    }
  }

  private generateBotResponse(userMessage: string) {
    const message = userMessage.toLowerCase();

    // Simple keyword-based responses
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      this.addBotMessage(`Hello! 👋 I'm excited to help you with CLARK today. What would you like to know about our cybersecurity curriculum platform?`);
    } else if (message.includes('browse') || message.includes('search') || message.includes('find')) {
      this.addBotMessage(`You can browse our extensive curriculum library by visiting the <a href="/browse" target="_blank">Browse page</a>. Use filters to narrow down by academic level, topic, or learning object type. We have thousands of peer-reviewed cybersecurity resources ready for your classroom!`);
    } else if (message.includes('contribute') || message.includes('submit') || message.includes('share')) {
      this.addBotMessage(`That's fantastic! Contributing to CLARK helps grow our cybersecurity education community. Start by visiting your <a href="/onion/dashboard" target="_blank">Dashboard</a> to create new learning objects. Check our <a href="/contribute-page" target="_blank">Contributors guide</a> for detailed instructions on our submission and review process.`);
    } else if (message.includes('help') || message.includes('support') || message.includes('question')) {
      this.addBotMessage(`I'm here to help! For technical support, email us at <a href="mailto:info@secured.team">info@secured.team</a>. You can also visit our <a href="http://help.clark.center" target="_blank">Help Center</a> for tutorials and troubleshooting guides. What specific area do you need assistance with?`);
    } else if (message.includes('free') || message.includes('cost') || message.includes('price')) {
      this.addBotMessage(`Yes! CLARK is completely <strong>free</strong> to use. All our curriculum is available under the CC BY-NC-SA 4.0 license, which means you can freely download, use, and adapt our materials for educational purposes. No hidden fees, no subscriptions - just quality cybersecurity education for everyone! 🎓`);
    } else if (message.includes('login') || message.includes('register') || message.includes('account')) {
      this.addBotMessage(`Creating an account is easy! Click the "Register" button in the top navigation to get started. With an account, you can save materials to your library, contribute content, and access additional features. Registration is free and only requires a valid email address.`);
    } else if (message.includes('topic') || message.includes('subject') || message.includes('cybersecurity')) {
      this.addBotMessage(`CLARK covers a wide range of cybersecurity topics including:<br><br>
        • Network Security<br>
        • Cryptography<br>
        • Digital Forensics<br>
        • Ethical Hacking<br>
        • Risk Management<br>
        • Privacy & Policy<br>
        • And many more!<br><br>
        Use our <a href="/browse" target="_blank">topic filters</a> to explore specific areas of interest.`);
    } else {
      // Generic helpful response
      this.addBotMessage(`That's a great question! While I'm still learning, I can help you with:<br><br>
        • Browsing curriculum and resources<br>
        • Contributing content to CLARK<br>
        • Platform navigation and features<br>
        • General information about cybersecurity education<br><br>
        For specific technical questions, you might want to contact our support team at <a href="mailto:info@secured.team">info@secured.team</a> or check our <a href="http://help.clark.center" target="_blank">Help Center</a>. Is there something specific I can help you find today? 🔍`);
    }
  }

  private scrollToBottom() {
    setTimeout(() => {
      if (this.messagesContainer) {
        const container = this.messagesContainer.nativeElement;
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }
}
