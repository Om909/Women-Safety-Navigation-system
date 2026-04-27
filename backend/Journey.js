const sendSOS = async () => {

  await fetch("http://localhost:5000/sos", {
    method: "POST"
  });

  alert("Emergency Alert Sent!");

}