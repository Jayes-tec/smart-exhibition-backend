const app = require("./app");
const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>{
    console.log(`server running on the port ${PORT}`);

});

