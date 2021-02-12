document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', send_email);
  

  // By default, load the inbox
  load_mailbox('inbox');
});


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#mail-info').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#mail-info').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      
    
      
      emails.forEach(email=>{
      const emailview=document.querySelector('#emails-view');
      const mail=document.createElement('div');
      const mail_sender=document.createElement('div');
      const mail_subject=document.createElement('div');
      const mail_time=document.createElement('div');
      
      
      mail.className="mail_list";
      mail_sender.className="sender";
      mail_subject.className="subject";
      mail_time.className="time";
     

      mail_sender.innerHTML=email.sender;
      mail_subject.innerHTML=email.subject;
      mail_time.innerHTML=email.timestamp;
      
       
      if (mailbox=="inbox" || mailbox=="sent") {
          if (email.read){
            mail.style.background = 'grey';

       }
      }

      mail.addEventListener('click',()=> open_mail(email.id));
      mail.appendChild(mail_sender);
      mail.appendChild(mail_subject);
      mail.appendChild(mail_time);
      emailview.appendChild(mail);

       });   
   });
}

function send_email(){
   
    event.preventDefault();
    const recipients=document.querySelector('#compose-recipients').value;
    const subject=document.querySelector('#compose-subject').value;
    const body=document.querySelector('#compose-body').value;

    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
      })
    })
.then(response => response.json())
.then(result => {
    
    
    if ("error" in result) {
      alert(`${result.error}`);
      }
    else {
      alert(`${result.message}`);
      load_mailbox('sent');
    }

  });

  };

function open_mail(id){

  fetch(`/emails/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
      read: true
      })
    })
  
  fetch(`emails/${id}`)
  .then(response=> response.json())
  .then(email=>{

    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#mail-info').style.display='block';
    const user=document.querySelector('h2').innerHTML;
    const reply_button=document.createElement('button');
    const archive_button=document.createElement('button');
    reply_button.id="reply_button";
    archive_button.innerHTML="Archive"
    reply_button.innerHTML="Reply";
    reply_button.addEventListener('click',()=> reply_mail(email.sender,email.recipients,email.subject,email.timestamp,email.body));
    archive_button.addEventListener('click',()=> archive(email.id));
    

    if (email.archived) {

      document.querySelector('#mail-info').innerHTML=`<b>From:</b> ${email.sender}<br><b>Recipients:</b> ${email.recipients} <br><b>Subject:</b> 
      ${email.subject} <br><b>Timestamp:</b>${email.timestamp}<br><b> Body:</b> ${email.body} <br><button onclick="unarchive(${email.id})">unarchive</button><br>`;

    }

    else{
      document.querySelector('#mail-info').innerHTML=`<b>From:</b> ${email.sender}<br><b>Recipients:</b> ${email.recipients} <br><b>Subject:</b> 
      ${email.subject} <br><b>Timestamp:</b>${email.timestamp}<br> <b>Body:</b> ${email.body} <br>`;
      if(user!==email.sender){
        document.querySelector('#mail-info').appendChild(archive_button);   
      }
    }
    document.querySelector('#mail-info').appendChild(reply_button);
  });

}

function unarchive(id){
  
  fetch(`/emails/${id}`, {
  method: 'PUT',
  body: JSON.stringify({
      archived: false
  })
})

 .then(()=>load_mailbox('inbox'));
}

function archive(id){
  
  fetch(`/emails/${id}`, {
  method: 'PUT',
  body: JSON.stringify({
      archived: true
  })
})
 .then(()=>load_mailbox('inbox'));
 

}

function reply_mail(sender,recipients,subject,time,body){

  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#mail-info').style.display='none';
  const user=document.querySelector('h2').innerHTML;
  if(sender==user){
   
    document.querySelector('#compose-recipients').value=recipients;   
  }
  else{

    document.querySelector('#compose-recipients').value=sender;
  }
  
  if (subject.startsWith("Re:")) {
  document.querySelector('#compose-subject').value= subject;

  }
  else{
   
   document.querySelector('#compose-subject').value="Re:"+ subject;

  }

  document.querySelector('#compose-body').value="On" + " " + time + " "+ sender +" " + "wrote:"+ body;
}






