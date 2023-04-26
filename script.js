const togglep5 = () =>{
    let p5DivStatus = document.getElementById('p5-projects').style.display
    // if it is currently hidden, we return true
    let p5DivHidden = !p5DivStatus || p5DivStatus == 'none';
    toggleSketch(p5DivHidden)
    document.getElementById('p5-projects').style.display = p5DivHidden ? 'block' : 'none';
}

console.log('about to fetch a rainbow');
fetch('style.css').then(res => {
    console.log(res);
    return res.blob();
}).then(res => {
    console.log(res);
    console.log()
})

