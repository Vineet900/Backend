import axios from 'axios';

async function check() {
  try {
    const res = await axios.get('http://localhost:4000/api/courses');
    const courses = res.data.data;
    
    console.log(`✅ Found ${courses.length} courses`);
    const css = courses.find(c => c.slug === 'css');
    if (css && css.lessons) {
      console.log(`📚 CSS Lessons (First 3):`);
      css.lessons.slice(0, 3).forEach(l => {
        console.log(` - ${l.title}: slug='${l.slug}'`);
      });
    }
  } catch (err) {
    console.error('❌ API Check Failed:', err.message);
  }
}

check();
