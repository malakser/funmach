// Example of a cool feature: animated greeting
const greet = () => {
  const colors = ['red', 'blue', 'green', 'orange', 'purple'];
  let index = 0;
  setInterval(() => {
    document.body.style.backgroundColor = colors[index % colors.length];
    index++;
  }, 500);
};

greet();
