{
    "firstName":"Chirag",
    "lastName":"Bansal",
    "emailId":"chiragbansal@gmail.com",
    "password":"Chirag@2002"
}


{
    "emailId":"chiragbansal@gmail.com",
    "password":"Chirag@2002"
}





{
  "title": "Valid Palindrome",
  "description": "Given a string s, return true if it is a palindrome, ignoring all non-alphanumeric characters and cases.",
  "difficulty": "easy",
  "tags": ["string"],
  "visibleTestCases": [
    {
      "input": "A man, a plan, a canal: Panama",
      "output": "true",
      "explanation": "After removing non-alphanumeric characters and converting to lowercase: 'amanaplanacanalpanama' is a palindrome"
    },
    {
      "input": "race a car",
      "output": "false",
      "explanation": "After processing: 'raceacar' is not a palindrome"
    }
  ],
  "hiddenTestCases": [
    {
      "input": "No lemon, no melon",
      "output": "true"
    },
    {
      "input": "0P",
      "output": "false"
    }
  ],
  "starterCode": [
    {
      "language": "javascript",
      "initialCode": "var isPalindrome = function(s) {\n  // Write your code here\n};"
    },
    {
      "language": "c++",
      "initialCode": "class Solution { public: bool isPalindrome(string s) { /* code here */ } };"
    },
    {
      "language": "java",
      "initialCode": "class Solution { public boolean isPalindrome(String s) { /* code here */ } }"
    }
  ],
  "referenceSolution": [
    {
      "language": "javascript",
      "completeCode": "const s = require('fs').readFileSync(0,'utf-8').trim();\nconst str = s.toLowerCase().replace(/[^a-z0-9]/g,'');\nlet i=0,j=str.length-1;\nwhile(i<j){ if(str[i]!==str[j]){console.log('false');process.exit();} i++;j--; }\nconsole.log('true');"
    },
    {
      "language": "c++",
      "completeCode": "#include <bits/stdc++.h>\nusing namespace std;\nint main(){ string s; getline(cin,s); string t=\"\"; for(char c:s){ if(isalnum(c)) t+=tolower(c);} int i=0,j=t.size()-1; while(i<j){ if(t[i]!=t[j]){ cout<<\"false\"; return 0;} i++;j--; } cout<<\"true\"; return 0;}"
    },
    {
      "language": "java",
      "completeCode": "import java.util.*;\npublic class Main{ public static void main(String[] args){ Scanner sc=new Scanner(System.in); String s=sc.nextLine(); s=s.toLowerCase().replaceAll(\"[^a-z0-9]\",\"\"); int i=0,j=s.length()-1; while(i<j){ if(s.charAt(i)!=s.charAt(j)){ System.out.println(\"false\"); return;} i++; j--; } System.out.println(\"true\"); }}"
    }
  ]
}



{
    "language": "c++",
    "code": "#include <bits/stdc++.h>\nusing namespace std;\nint main(){ string s; getline(cin,s); int f[256]={0}; for(char c:s) f[c]++; for(int i=0;i<s.size();i++){ if(f[s[i]]==1){ cout<<i; return 0;} } cout<<-1; }"
}