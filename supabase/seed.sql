-- Pasa a Supabase las 3 entradas que había en src/content/blog (contenido ya en HTML).
-- Pegar en Supabase → SQL Editor → Run. Se puede repetir: no duplica ni pisa lo que ya exista.
insert into public.posts (slug, title, excerpt, content, author, image, featured, published, published_at) values
('5-lugares-primera-visita-nyc', '5 lugares que no puedes perderte en tu primera visita a Nueva York', 'Si es tu primera vez en la ciudad, no todo son rascacielos. Esto es lo que yo recomiendo ver primero, sin gastar el día entero en colas.', $c$<p>Llevo más de 15 años enseñando Nueva York a gente que la pisa por primera vez, y siempre me hacen la misma pregunta: &quot;Wilson, ¿qué vemos si solo tenemos dos o tres días?&quot;. Esta es mi respuesta corta.</p>
<h2>1. Empire State al atardecer, no de noche</h2>
<p>Todo el mundo sube de noche porque &quot;se ve la ciudad iluminada&quot;. El problema es que a esa hora hay el doble de gente y la cola puede superar la hora. Sube justo antes de que se ponga el sol: ves la ciudad de día, luego el atardecer, y luego se encienden las luces sin moverte del mismo sitio.</p>
<h2>2. Brooklyn Bridge cruzando a pie, de Manhattan a Brooklyn</h2>
<p>No al revés. Cruzando hacia Brooklyn tienes el skyline de Manhattan de frente todo el camino, que es la foto que en realidad quieres. Ve temprano, antes de las 9am, y te lo cruzas casi solo.</p>
<h2>3. Un barrio de verdad, no solo Times Square</h2>
<p>Times Square hay que verlo, sí, pero no es Nueva York. Dedica al menos una tarde a Harlem o al West Village para ver cómo vive la gente de aquí de verdad, lejos de las tiendas de souvenirs.</p>
<h2>4. Central Park por la zona norte</h2>
<p>La mayoría de turistas solo pisa la punta sur del parque, cerca de la Quinta Avenida. La zona norte, cerca de Harlem, tiene menos gente y paisajes que parecen sacados de otro estado.</p>
<h2>5. Un partido, aunque no entiendas las reglas</h2>
<p>Da igual que no sepas nada de béisbol o baloncesto: la experiencia de un estadio americano lleno es algo que no se olvida. Si coincide con tu viaje, resérvalo con tiempo.</p>
<p>Si quieres que te lleve a varios de estos sitios en un mismo día, sin perder tiempo entre uno y otro, échale un ojo a mis <a href="/#tours">tours</a>.</p>
$c$, 'Wilson Silver', '/images/parque1.jpg', true, true, '2026-01-12'),
('como-moverte-metro-nueva-york', 'Cómo moverte en metro por Nueva York sin perderte', 'El metro de Nueva York asusta la primera vez: 24 líneas, trenes locales y express con el mismo color... Te lo explico como se lo explico a mis grupos.', $c$<p>La primera vez que alguien de mi grupo ve un mapa del metro de Nueva York, la cara que pone lo dice todo. Y es normal: tiene 24 líneas y algunas comparten color pero no comparten recorrido. Vamos por partes.</p>
<h2>Local vs. Express</h2>
<p>Esto es lo primero que hay que entender. Un tren <strong>local</strong> para en todas las estaciones de su línea. Un tren <strong>express</strong> se salta varias y solo para en las principales. Dos trenes pueden compartir el mismo color en el mapa y aun así ir a paradas distintas, así que mira siempre el número o la letra, no solo el color.</p>
<h2>La tarjeta OMNY</h2>
<p>Olvídate de la MetroCard de papel: ahora casi todo el mundo usa <strong>OMNY</strong>, el sistema que te deja pagar directamente acercando tu tarjeta de crédito o el móvil al torniquete. No hace falta comprar nada con antelación ni recargar una tarjeta física.</p>
<h2>Errores típicos que veo cada semana</h2>
<ul>
<li>Subir al tren en la dirección contraria (Uptown vs. Downtown): las señales están arriba, en el andén, no dentro del vagón.</li>
<li>Confundir Brooklyn con Queens al leer el destino final de la línea.</li>
<li>Correr por las escaleras para coger un tren: en hora punta pasa uno cada 3-5 minutos, no merece la pena.</li>
</ul>
<h2>Mi consejo real</h2>
<p>Descárgate la app oficial del MTA o Google Maps con las rutas de transporte activadas. Te dice en tiempo real cuánto tarda el próximo tren y si hay algún corte de línea, que aquí pasan más de lo que gustaría.</p>
<p>Si prefieres no pensar en nada de esto durante tu viaje, en mis tours nos movemos juntos y te enseño a leer el mapa sobre la marcha, para que cuando te quedes unos días más por tu cuenta ya vayas suelto.</p>
$c$, 'Wilson Silver', '/images/imagenesfreetour/tram.jpg', false, true, '2026-01-28'),
('que-llevar-maleta-nueva-york-invierno', 'Qué llevar en la maleta para un viaje a Nueva York en invierno', 'El frío de Nueva York no es como el de otras ciudades: es un frío seco y con viento entre rascacielos. Esto es lo que no debería faltarte.', $c$<p>Cada invierno veo a turistas temblando en la calle con un abrigo que en su ciudad les habría bastado de sobra. El frío aquí, sobre todo entre avenidas donde el viento se mete como en un túnel, se siente distinto. Esto es lo que yo llevaría.</p>
<h2>Capas, no un abrigo enorme</h2>
<p>Funciona mejor llevar varias capas finas que un único abrigo grueso: una camiseta térmica, una sudadera o jersey, y encima un abrigo que corte el viento. Dentro de tiendas, restaurantes y el metro hace calor, así que poder quitarte capas es un alivio.</p>
<h2>Calzado cerrado y con buena suela</h2>
<p>Vas a caminar mucho más de lo que crees, y si nieva las aceras se quedan con placas de hielo varios días. Un calzado cómodo, cerrado y con buen agarre es más importante que uno &quot;bonito&quot;.</p>
<h2>Guantes, gorro y bufanda de verdad</h2>
<p>No los que llevas de adorno en tu ciudad. Aquí con -5°C y viento se agradecen de verdad, sobre todo si vas a estar esperando fuera para entrar a algún sitio.</p>
<h2>Un segundo par de calcetines</h2>
<p>Suena tonto, pero llevar un recambio en la mochila si el día es largo y hay nieve derritiéndose marca la diferencia entre disfrutar la tarde o querer volver corriendo al hotel.</p>
<h2>Lo que NO hace falta</h2>
<p>No hace falta ropa técnica de montaña ni nada pensado para -20°C, salvo que vengas en un pico de ola de frío. Nueva York en invierno es exigente, pero no es el Ártico.</p>
<p>Si vienes en temporada de frío, en mis tours siempre dejo paradas para calentarse dentro (una cafetería, un mercado cubierto) — no se trata de aguantar el frío, sino de disfrutar la ciudad también en invierno.</p>
$c$, 'Wilson Silver', '/images/imagenesmaraton/barrios.jpg', false, true, '2026-02-09')
on conflict (slug) do nothing;
