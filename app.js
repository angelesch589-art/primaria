// REEMPLAZÁ ESTOS DOS VALORES CON LOS DE TU PROYECTO EN SUPABASE
const SUPABASE_URL = 'https://qtchusrscvwgxypjivxf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_UikXO46oRoLnmjQmL4Bsrw_NtHINmNv';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Referencias al DOM
const form = document.getElementById('form-inscripcion');
const formTitulo = document.getElementById('form-titulo');
const inputId = document.getElementById('registro-id');
const inputAlias = document.getElementById('alias');
const inputTaller = document.getElementById('taller');
const inputCurso = document.getElementById('curso');
const inputFecha = document.getElementById('fecha_inscripcion');
const inputTurno = document.getElementById('turno');
const btnGuardar = document.getElementById('btn-guardar');
const btnCancelar = document.getElementById('btn-cancelar');
const filtroTaller = document.getElementById('filtro-taller');
const tablaBody = document.getElementById('tabla-body');

// Cargar datos al iniciar la página
document.addEventListener('DOMContentLoaded', () => {
  cargarInscripciones();
});

// Escuchar cambios en el filtro por taller (Indicador 4)
filtroTaller.addEventListener('change', () => {
  cargarInscripciones(filtroTaller.value);
});

// Función para LISTAR y FILTRAR registros desde Supabase (Indicadores 1, 4 y 5)
async function cargarInscripciones(tallerSeleccionado = 'Todos') {
  tablaBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Cargando...</td></tr>';

  let query = supabaseClient
    .from('inscripciones')
    .select('*')
    .order('id', { ascending: true });

  if (tallerSeleccionado !== 'Todos') {
    query = query.eq('taller', tallerSeleccionado);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error al cargar:', error);
    tablaBody.innerHTML = '<tr><td colspan="6" style="color:red; text-align:center;">Error al conectar con Supabase. Verificá tus claves.</td></tr>';
    return;
  }

  if (data.length === 0) {
    tablaBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No hay participantes registrados para este filtro.</td></tr>';
    return;
  }

  tablaBody.innerHTML = '';
  data.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.alias}</td>
      <td><strong>${item.taller}</strong></td>
      <td>${item.curso}</td>
      <td>${item.fecha_inscripcion}</td>
      <td>${item.turno}</td>
      <td>
        <button class="btn-edit" onclick="prepararEdicion(${item.id}, '${item.alias}', '${item.taller}', '${item.curso}', '${item.fecha_inscripcion}', '${item.turno}')">Editar</button>
        <button class="btn-delete" onclick="eliminarRegistro(${item.id})">Eliminar</button>
      </td>
    `;
    tablaBody.appendChild(tr);
  });
}

// Función para CREAR o MODIFICAR un registro (Indicadores 1 y 2)
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const datos = {
    alias: inputAlias.value.trim(),
    taller: inputTaller.value,
    curso: inputCurso.value.trim(),
    fecha_inscripcion: inputFecha.value,
    turno: inputTurno.value
  };

  const idEdicion = inputId.value;

  if (idEdicion) {
    // MODIFICAR registro existente (Indicador 2)
    const { error } = await supabaseClient
      .from('inscripciones')
      .update(datos)
      .eq('id', idEdicion);

    if (error) {
      alert('Error al actualizar: ' + error.message);
      return;
    }
  } else {
    // CREAR nuevo registro (Indicador 1)
    const { error } = await supabaseClient
      .from('inscripciones')
      .insert([datos]);

    if (error) {
      alert('Error al guardar: ' + error.message);
      return;
    }
  }

  resetearFormulario();
  cargarInscripciones(filtroTaller.value);
});

// Cargar datos en el formulario para editar
function prepararEdicion(id, alias, taller, curso, fecha, turno) {
  inputId.value = id;
  inputAlias.value = alias;
  inputTaller.value = taller;
  inputCurso.value = curso;
  inputFecha.value = fecha;
  inputTurno.value = turno;

  formTitulo.textContent = 'Modificar Inscripción';
  btnGuardar.textContent = 'Actualizar Registro';
  btnCancelar.classList.remove('oculto');
}

// Cancelar modo edición
btnCancelar.addEventListener('click', resetearFormulario);

function resetearFormulario() {
  form.reset();
  inputId.value = '';
  formTitulo.textContent = 'Nueva Inscripción';
  btnGuardar.textContent = 'Guardar Inscripción';
  btnCancelar.classList.add('oculto');
}

// Función para ELIMINAR un registro (Indicador 3)
async function eliminarRegistro(id) {
  const confirmar = confirm('¿Estás seguro de que deseas eliminar esta inscripción?');
  if (!confirmar) return;

  const { error } = await supabaseClient
    .from('inscripciones')
    .delete()
    .eq('id', id);

  if (error) {
    alert('Error al eliminar: ' + error.message);
    return;
  }

  cargarInscripciones(filtroTaller.value);
}