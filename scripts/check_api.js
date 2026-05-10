import axios from 'axios';

async function check() {
  try {
    const res = await axios.get('http://localhost:4000/api/courses');
    const courses = res.data.data;
    
    console.log(`✅ Found ${courses.length} courses`);
    courses.forEach(c => {
      console.log(` - ${c.title} (${c.slug}): ${c.lessons?.length || 0} lessons`);
    });
  } catch (err) {
    console.error('❌ API Check Failed:', err.message);
  }
}

check();
