import { Injectable, OnInit } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import * as Fuse from 'fuse.js';

@Injectable()
export class LearningObjectService {
  options = {
    shouldSort: true,
    threshold: 0.6,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: ['topic']
  };
  fuseGroup = [];
  groups = [
    {
      title: 'Towson Additions',
      learningObjects: [
        { topic: 'Cybersecurity for Future Presidents', class: 'Course' },
        // tslint:disable-next-line:max-line-length
        { topic: 'Integer Error CS0 C++ Demo', class: 'Nanomodule', url: 'http://cis1.towson.edu/~cyber4all/modules/nanomodules/Integer_Error-CS0_C++_Demo.html' },
      ]
    },
    {
      title: undefined,
      learningObjects: [
        { topic: 'Adverserial Thinking Module', class: 'Module' },
        { topic: 'Introduction to SCADA (3 hour lab)', class: 'Micromodule' },
        { topic: 'SCADA Control System Networking (9 E minute lab)', class: 'Micromodule' },
        { topic: 'Control System Network Enumeration and Denial of Service (2 hour lab)', class: 'Micromodule' },
        { topic: 'SCADA Control System Network Packet Alteration and Injection (2 hour lab)', class: 'Micromodule' },
        { topic: 'SCADA Control System Network Intrustion Detection (4 hour lab)', class: 'Micromodule' }
      ]
    },
    {
      title: 'Network Protection and Defense Exercises',
      learningObjects: [
        { topic: 'Web Security', class: 'Module' },
        { topic: 'Network Intrusion Detection', class: 'Module' },
        { topic: 'Vulnerability Discovery', class: 'Module' },
        { topic: 'Thwarting the Imminent threat', class: 'Module' },
        { topic: 'Malicious Malware', class: 'Module' },
        { topic: 'Length Logs: Attack Anaylsis- E', class: 'Module' },
        { topic: 'Length Logs: Attack Anaylsis-D', class: 'Module' },
        { topic: 'Networking anomalies: The packet capture edition', class: 'Module' },
        { topic: 'Cyber kill chain', class: 'Module' },
        { topic: 'Vulnerability taxonomies', class: 'Module' },
        { topic: 'Buffer overflows', class: 'Module' },
        { topic: 'Privilege escalation attacks', class: 'Module' },
        { topic: 'input validation issues', class: 'Module' },
        { topic: 'password weakneeses', class: 'Module' },
        { topic: 'Trust relationships', class: 'Module' },
        { topic: 'Race conditions', class: 'Module' },
        { topic: 'Local vs remote access', class: 'Module' },
      ]
    },
    {
      title: undefined,
      learningObjects: [
        { topic: 'Secure Design', class: 'Course' },
        { topic: 'Users:  The Weakest Link', class: 'Module' },
        { topic: 'Cybersecurity Chain', class: 'Nanomodule' },
        { topic: 'Users: The Unwelded Link', class: 'Nanomodule' },
        { topic: 'Users:  The Weakest Link', class: 'Nanomodule' },
        { topic: 'Users: The Malicious Link', class: 'Nanomodule' },
        { topic: 'Users:  The Strongest Link', class: 'Nanomodule' },
        { topic: 'Secure Design Vocabulary', class: 'Nanomodule' },
        { topic: 'Visual Design and Interaction Design', class: 'Module' },
        { topic: 'Introduction to User EDperience Design', class: 'Module' },
        { topic: 'Cybersecurity Basics', class: 'Module' },
        { topic: 'Confidentiality', class: 'Nanomodule' },
        { topic: 'Integrity', class: 'Nanomodule' },
        { topic: 'Availability', class: 'Nanomodule' },
        { topic: 'Cybersecurity in Practice', class: 'Nanomodule' },
        { topic: 'Cybersecurity and Internet of Things', class: 'Module' },
        { topic: 'IOT Basics', class: 'Nanomodule' },
        { topic: 'IOT and Cybersecurity', class: 'Nanomodule' },
        { topic: 'IOT Cybersecurity in Practice', class: 'Nanomodule' },
        { topic: 'Experimenting with a Smart Home', class: 'Module' },
        { topic: 'Example IOT Scenario:  Smart Home', class: 'Nanomodule' },
        { topic: 'Building a Smart IOT Home', class: 'Nanomodule' },
        { topic: 'Outsmaring the Home', class: 'Module' },
        { topic: 'Outsmarting the Smart Home:  Preparation', class: 'Nanomodule' },
        { topic: 'Outsmarting the Smart Home:  EDecution', class: 'Nanomodule' },
        { topic: 'Prototyping', class: 'Module' },
        { topic: 'Prototypes-Usability Testing', class: 'Module' },
        { topic: 'Secure Design Analysis', class: 'Module' },
      ]
    },
    {
      title: undefined,
      learningObjects: [
        { topic: 'Cybersecurity Principles', class: 'Course' },
        { topic: 'The McCumber Cube', class: 'Module' },
      ]
    },
    {
      title: undefined,
      learningObjects: [
        { topic: 'Network Security', class: 'Course' },
        { topic: 'Networking Concepts', class: 'Module'},
        { topic: 'Networking Overview', class: 'Nanomodule'},
        { topic: 'Firewalls', class: 'Micromodule'},
        { topic: 'Introduction to IoT Frameworks and Applications (CNAP_ ED_IoT Survey)', class: 'Module'},
        { topic: 'Introduction to Cryptography', class: 'Module'},
        { topic: 'Raspberry Pi and Its Programming with Various Sensors (CNAP_ E3_Raspberry Pi)', class: 'Module'},
        { topic: 'LightweightIoT Protocol MQTT (CNAP_ E4_MQTT)', class: 'Module'},
        { topic: 'Attacks Against IoT (CNAP_ E6_IoTAttacks)', class: 'Module'},
        { topic: 'Amazon AWS IoT Framework and Service (CNAP_ E5_AWSIoT-GetStarted)', class: 'Module'},
        { topic: 'Smart Home, Sensor Networks, Smart Grid, Smart City, and Other Applications with IoT (CNAP_ E2_SmartHome)', class: 'Module'}
      ]
    },
    {
      title: undefined,
      learningObjects: [
        { topic: 'Cyber Ethics', class: 'Course' },
      ]
    },
    {
      title: undefined,
      learningObjects: [
        { topic: 'Cybersecurity I', class: 'Course' },
        { topic: 'Dissecting Breaches', class: 'Module' },
        { topic: 'Email Security', class: 'Module' },
        { topic: 'Web Security', class: 'Module' },
        { topic: 'Network Security', class: 'Module' },
        { topic: 'Access Control', class: 'Module' },
        { topic: 'Firewall', class: 'Module' },
        { topic: 'Cryptography', class: 'Module' },
        { topic: 'Malware', class: 'Module' }
      ]
    },
    {
      title: undefined,
      learningObjects: [
        { topic: 'Cybersecurity II', class: 'Course' },
        { topic: 'Basic Concepts', class: 'Module' },
        { topic: 'Symmetric Encryption', class: 'Module' },
        { topic: 'Public Key Encryption', class: 'Module' },
        { topic: 'PKI', class: 'Module' },
        { topic: 'Kerberos', class: 'Module' },
        { topic: 'Malware Analysis', class: 'Module' },
        { topic: 'Basic Static Analysis', class: 'Module' },
        { topic: 'Basic Dynamic Analysis', class: 'Module' },
        { topic: 'Malware Behavior', class: 'Module' }
      ]
    },
    {
      title: undefined,
      learningObjects: [
        { topic: 'Scripting for Automation and Security', class: 'Course' },
        { topic: 'Introduction to Scipting', class: 'Module' },
        { topic: 'Scripting and working with files', class: 'Module' },
        { topic: 'BASH and PowerShell reading from files', class: 'Module' },
        { topic: 'Working with Web communication: BASH and PowerShell', class: 'Module' },
        { topic: 'Web Authentication', class: 'Module' },
        { topic: 'Working with SQL databases: Perl and Python', class: 'Module' },
        { topic: 'Working with SQL databases: Bash and PowerShell', class: 'Module' },
        { topic: 'SQL Injection vulnerabilities', class: 'Module' }
      ]
    },
    {
      title: undefined,
      learningObjects: [
        { topic: 'Network Security', class: '' },
        { topic: 'Introduction to Penetration Testing', class: '' },
        { topic: 'Reconnaissance', class: '' },
        { topic: 'Scanning', class: '' },
        { topic: 'Exploitation', class: '' },
        { topic: 'Password Attacks', class: '' },
        { topic: 'Wireless Security', class: '' }
      ]
    },
    {
      title: undefined,
      learningObjects: [
        { topic: 'Cybersecurity fundamemtals', class: 'Course' },
        { topic: 'Authentication', class: 'Module' },
        { topic: 'Auth.Basics', class: 'Nanomodule' },
        { topic: 'Auth. System', class: 'Nanomodule' },
        { topic: 'Password Storage', class: 'Nanomodule' },
        { topic: 'Secure Storage', class: 'Nanomodule' },
        { topic: 'Encryption for authentication', class: 'Nanomodule' },
        { topic: 'Password Attacks - Exhaustion', class: 'Nanomodule' },
        { topic: 'Password Attacks using and Exploiting Software', class: 'Nanomodule' },
        { topic: 'Password attacks using Social Engineeering', class: 'Nanomodule' },
        { topic: 'Vital Signs of Identity', class: 'Nanomodule' },
        { topic: 'Physiological Biometrics', class: 'Nanomodule' },
        { topic: 'Behavioral Biometrics', class: 'Nanomodule' },
        { topic: 'Security Requirements', class: 'Module' },
        { topic: 'The Basics', class: 'Nanomodule' },
        { topic: 'Abuse Cases', class: 'Nanomodule' },
      ]
    },
    {
      title: undefined,
      learningObjects: [
        { topic: 'Introduction to Software Security', class: 'Course' },
        { topic: 'Introduction', class: 'Module' },
        { topic: 'Fundamentals of Software Security', class: 'Micromodule' },
        { topic: 'Fundamentals of Privacy', class: 'Micromodule' },
        { topic: 'Common Vulnerabilities', class: 'Module' },
        { topic: 'Vulnerability Rankings', class: 'Micromodule' },
        { topic: 'Improper Input Validation', class: 'Micromodule' },
        { topic: 'Overflows', class: 'Micromodule' },
        { topic: 'Improper Authentication', class: 'Micromodule' },
        { topic: 'Improper Access Control', class: 'Micromodule' },
        { topic: 'Improper Data Exposure', class: 'Micromodule' },
        { topic: 'Use of Dangerous Components', class: 'Micromodule' },
        { topic: 'Security Misconfiguration', class: 'Micromodule' },
        { topic: 'Secure Software Development Lifecycle', class: 'Module' },
        { topic: 'Secure Software Development Lifecycle Overview', class: 'Micromodule' },
        { topic: 'Requirements', class: 'Micromodule' },
        { topic: 'Design', class: 'Micromodule' },
      ]
    },
    {
      title: undefined,
      learningObjects: [
        { topic: 'Multidisciplinary Risk Management in Cybersecurity', class: 'Course' },
        { topic: 'Fundamentals of Risk Management', class: 'Module' },
        { topic: 'Fundamentals of Cybersecurity', class: 'Micromodule' },
        { topic: 'Fundamentals of Risk Management', class: 'Micromodule' },
        { topic: 'RM Tools and Techniques', class: 'Micromodule' },
        { topic: 'Web and Network Traffic Privacy', class: 'Module' },
        { topic: 'Introduction to WebCookies and Javascript', class: 'Nanomodule' },
        { topic: 'Tracking Browsing History', class: 'Nanomodule' },
        { topic: 'Location Privacy', class: 'Module' },
        { topic: 'Location Privacy and Location Based Services', class: 'Nanomodule' },
        { topic: 'Software Security and Secure Programming', class: 'Course' },
        { topic: 'SW Security Fundamentals (#D)', class: 'Module' },
        { topic: 'SW Security Design Principles, Threats, and Countermeasures (#2)', class: 'Micromodule' },
        { topic: 'Secure OO SW Programming (# 4)', class: 'Module' },
        { topic: 'Secure Network File I/o and concurrent programming (#5)', class: 'Module' },
        { topic: 'SW Programming Platform Security (#6)', class: 'Module' },
        { topic: 'Computer Security: What? Why? Why Now?  Basic Concepts and Terminology', class: 'Module' },
        { topic: 'Computer Security Definition and Its Importance', class: 'Nanomodule' },
        { topic: 'Cyber Attacks:  The Historical Development', class: 'Nanomodule' },
        { topic: 'Cyber Attacks Classification and EDamples', class: 'Nanomodule' },
        { topic: 'Review of Basic Security Concepts:  Threats, Vulnerabilities, Risks, Attacks and Protection Mechanisms', class: 'Nanomodule' },
        { topic: 'Cybersecurity Future Developments', class: 'Nanomodule' },
        { topic: 'Cybersecurity Tools', class: 'Nanomodule' },
        { topic: 'Firewall Design', class: 'Module' },
        { topic: 'Firewall Definition, History and Functions', class: 'Nanomodule' },
        { topic: 'Firewall Types and Configurations', class: 'Nanomodule' },
        { topic: 'Firewall Design and Implementation Recommendations', class: 'Nanomodule' },
        { topic: 'Popular Firewalls', class: 'Nanomodule' },
        { topic: 'Firewall Design and Operations as Production Rules AI Systems', class: 'Nanomodule' },
        { topic: 'Intrusion Detection and Prevention Systems', class: 'Module' },
        { topic: 'Intrusion Detection History and Its Role in Computer Security', class: 'Nanomodule' },
        { topic: 'IDS Models and Types', class: 'Nanomodule' },
        { topic: 'Artificial Intelligence and Machine Learning in IDPS Design', class: 'Nanomodule' },
        { topic: 'IDPS Performance Evaluation', class: 'Nanomodule' },
        { topic: 'Integration of Intrusion Detection and Prevention', class: 'Nanomodule' },
        { topic: 'Research on Intrusion Detection and Prevention', class: 'Nanomodule' },
        { topic: 'Malware and Vulnerabiliites Detection and Protection', class: 'Module' },
        { topic: 'Malware Classification and Terminology', class: 'Nanomodule' },
        { topic: 'Malware History and Examples', class: 'Nanomodule' },
        { topic: 'Vulnerabilities', class: 'Nanomodule' },
        { topic: 'Malware Infection', class: 'Nanomodule' },
        { topic: 'Malware Detection and Prevention', class: 'Nanomodule' },
        { topic: 'Malware Incident Response and Tools', class: 'Nanomodule' },
        { topic: 'Hackers Attacks, Their Recognition and Prevention', class: 'Module' },
        { topic: 'Hackers\'s Attacks Examples', class: 'Nanomodule' },
        { topic: 'Review of Hackers\' Activities', class: 'Nanomodule' },
        { topic: 'Study of Typical Hacker\'s Behavior and Profiling', class: 'Nanomodule' },
        { topic: 'Hacker\'s Technique\'s Analysis', class: 'Nanomodule' },
        { topic: 'Protection Against Hackers', class: 'Nanomodule' },
        { topic: 'Cybersecurity Tools', class: 'Nanomodule' },
        { topic: 'Research Assignment', class: 'Nanomodule' },
        { topic: 'History of Cybersecurity', class: 'Module' },
        { topic: 'Human Security', class: 'Module' },
        { topic: 'Enterprise Security', class: 'Module' },
        { topic: 'Data Security', class: 'Module' },
        { topic: 'Risk Management', class: 'Module' },
        { topic: 'ICS', class: 'Nanomodule' },
        { topic: 'Creating a hub', class: 'Micromodule' },
      ]
    },
    {
      title: undefined,
      learningObjects: [
        { topic: 'Vehicular Data Buses', class: 'Module' },
        { topic: 'Vehicular data bus types', class: '' },
        { topic: 'Data bus security', class: '' },
        { topic: 'Impact of Wireless Interfaces', class: '' },
      ]
    },
    {
      title: undefined,
      learningObjects: [
        { topic: 'Physical Layer Sec and Spectrum Monitoring', class: 'Module' },
        { topic: 'Intro', class: '' },
        { topic: 'Spectrum Sensoring and monitoring', class: '' },
        { topic: 'Cellular networking', class: '' },
        { topic: '4G-LTE', class: '' }
      ]
    },
    {
      title: undefined,
      learningObjects: [
        { topic: 'Operating System Hardening', class: 'Course' },
        { topic: 'Secure Installation', class: 'Module' },
        { topic: 'Removing Unnecessary Components', class: 'Module' },
        { topic: 'File System Maintenance', class: 'Module' },
        { topic: 'User restrictions', class: 'Module' },
      ]
    }
  ];
  filteredResults;

  dataObserver;
  data;

  constructor(private http: Http) {
    this.data = new Observable(observer => this.dataObserver = observer);
    for (const g of this.groups) {
      this.fuseGroup.push(new Fuse(g.learningObjects, this.options));
    }
  }

  observeFiltered(): Observable<{}[]> {
    return this.data;
  }

  search(query) {
    this.filteredResults = [];
    for (const g of this.fuseGroup) {
      this.filteredResults.push({
        learningObjects: g.search(query)
      });
    }
    this.dataObserver.next(this.filteredResults);
  }
  clearSearch() {
    this.filteredResults = [];
    this.dataObserver.next(this.filteredResults);
  }
  openLearningObject(url: string) {
    // location.href = url;
    window.open(url);
  }
}
