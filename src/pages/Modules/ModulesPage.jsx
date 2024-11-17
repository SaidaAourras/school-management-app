import { useState, useEffect } from 'react';
import {
  PlusCircle,
  Edit,
  RefreshCcw,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchModules,
  deleteModule,
  addModule,
  editModule,
} from '../../features/modules/moduleSlice';
import Modal from './components/Modal';

function ModulesPage() {
  const dispatch = useDispatch();
  const modules = useSelector((state) => state.modules.list);
  const status = useSelector((state) => state.modules.status);
  const [filterSecteur, setfilterSecteur] = useState('Digital');
  const [filterNiveau, setFilterNiveau] = useState('1A');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsParPage = 3;
  const [formData, setFormData] = useState({
    code: '',
    intitule: '',
    masseHoraire: '',
    filiere: '',
    niveau: '',
    competences: '',
    secteur: '',
    formateur: '',
  });

  useEffect(() => {
    dispatch(fetchModules());
  }, [dispatch]);

  const filteredModules = modules.filter(
    (module) =>
      module.secteur === filterSecteur &&
      module.niveau === filterNiveau &&
      (module.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.intitule.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredModules.length / itemsParPage);
  const indexOfLastItem = currentPage * itemsParPage;
  const indexOfFirstItem = indexOfLastItem - itemsParPage;
  const currentItems = filteredModules.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handleUpdateModule = () => {
    setEditingModuleId(null);
    setIsModalOpen(true);
  };

  const handleEditModule = (module) => {
    setEditingModuleId(module.id);
    setFormData({
      code: module.code,
      intitule: module.intitule,
      masseHoraire: module.masseHoraire,
      filiere: module.filiere,
      niveau: module.niveau,
      competences: module.competences,
      secteur: module.secteur,
      formateur: module.formateur,
    });
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setFormData({
      code: '',
      intitule: '',
      masseHoraire: '',
      filiere: '',
      niveau: '',
      competences: '',
      secteur: '',
      formateur: '',
    });
    setEditingModuleId(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDelete = (id) => {
    dispatch(deleteModule(id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const etat = formData.formateur && formData.secteur ? 'Affecté' : 'non Affecté';
    if (editingModuleId) {
      const updatedModule = { ...formData, id: editingModuleId, etat };
      dispatch(editModule(updatedModule));
    } else {
      const newId = modules.length > 0 ? Math.max(...modules.map((mod) => mod.id)) + 1 : 1;
      const newModule = {
        ...formData,
        id: newId.toString,
        competences: formData.competences.toString(),
        etat,
      };
      dispatch(addModule(newModule));
    }
    handleModalClose();
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Failed to load modules</div>
          <button
            onClick={() => dispatch(fetchModules())}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold">Liste des Modules</h2>
        <div className="flex gap-2">
          <button onClick={() => dispatch(fetchModules())} className="btn btn-ghost btn-sm tooltip">
            <RefreshCcw className="w-4 h-4" />
          </button>
          <button onClick={handleUpdateModule} className="btn btn-outline btn-primary btn-sm gap-2">
            <PlusCircle className="w-4 h-4" />
            Add Module
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="flex flex-col sm:flex-row gap-4 py-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50 w-4 h-4" />
          </div>
          <input
            type="text"
            className="input input-bordered block pl-10 pr-3 py-2"
            placeholder="Search modules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={filterSecteur}
          onChange={(e) => setfilterSecteur(e.target.value)}
          className="select select-bordered"
        >
          <option value="Digital">Digital</option>
          <option value="Agro-ali">Agro-ali</option>
          <option value="Finance">Finance</option>
          <option value="Marketing">Marketing</option>
        </select>
        <select
          value={filterNiveau}
          onChange={(e) => setFilterNiveau(e.target.value)}
          className="select select-bordered"
        >
          <option value="1A">1ère année</option>
          <option value="2A">2ème année</option>
        </select>
      </div>

      {/* Modules Table */}
      <div className="rounded-lg border bg-base-100 hidden md:block">
        <table className="table table-zebra w-full">
          <thead className="bg-base-200">
            <tr>
              <th className="cursor-pointer hover:bg-base-300 transition-colors duration-200">
                Code
              </th>
              <th className="cursor-pointer hover:bg-base-300 transition-colors duration-200">
                Intitulé
              </th>
              <th className="cursor-pointer hover:bg-base-300 transition-colors duration-200">
                Masse Horaire
              </th>
              <th className="cursor-pointer hover:bg-base-300 transition-colors duration-200">
                Filière
              </th>
              <th className="cursor-pointer hover:bg-base-300 transition-colors duration-200">
                Niveau
              </th>
              <th className="cursor-pointer hover:bg-base-300 transition-colors duration-200">
                Compétences
              </th>
              <th className="cursor-pointer hover:bg-base-300 transition-colors duration-200">
                Etat
              </th>
              <th className="flex items-center gap-1 pl-2">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.map((module, index) => (
              <tr key={index}>
                <td className="hover">{module.code}</td>
                <td className="hover">{module.intitule}</td>
                <td className="hover">{module.masseHoraire}</td>
                <td className="hover">{module.filiere}</td>
                <td className="hover">{module.niveau}</td>
                <td className="hover">{module.competences}</td>
                <td className="hover">
                  <div
                    className={`${
                      module.etat === 'Affecté'
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                    } inline-block px-2 py-1 rounded`}
                  >
                    {module.etat}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    className="text-gray-600 hover:text-gray-900 mr-3"
                    onClick={() => handleEditModule(module)}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    className="text-orange-600 hover:text-red-900"
                    onClick={() => handleDelete(module.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6 mt-4">
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <nav
            className="isolate inline-flex -space-x-px rounded-md shadow-sm"
            aria-label="Pagination"
          >
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                currentPage === 1 ? 'cursor-not-allowed' : 'hover:bg-gray-50'
              }`}
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => handlePageChange(index + 1)}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                  currentPage === index + 1
                    ? 'z-10 bg-gray-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 '
                    : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                }`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                currentPage === totalPages ? 'cursor-not-allowed' : 'hover:bg-gray-50'
              }`}
            >
              <span className="sr-only">Next</span>
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>

      {/* Add Module Modal */}
      <Modal isOpen={isModalOpen} onClose={handleModalClose}>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code Module</label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Intitulé Module
              </label>
              <input
                type="text"
                name="intitule"
                value={formData.intitule}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Masse Horaire</label>
              <input
                type="number"
                name="masseHoraire"
                value={formData.masseHoraire}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filiere</label>
              <input
                type="text"
                name="filiere"
                value={formData.filiere}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Secteur</label>
              <select
                name="secteur"
                value={formData.secteur}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                required
              >
                <option value="Digital">Digital</option>
                <option value="Agro-ali">Agro-ali</option>
                <option value="Finance">Finance</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Niveau</label>
              <select
                name="niveau"
                value={formData.niveau}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                required
              >
                <option value="1A">1ère année</option>
                <option value="2A">2ème année</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Compétences</label>
              <input
                type="text"
                name="competences"
                value={formData.competences}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                placeholder="Separate with commas"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Formateur</label>
              <input
                type="text"
                name="formateur"
                value={formData.formateur}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button type="button" onClick={handleModalClose} className="btn btn-ghos">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary gap-2">
                Save Module
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}

export default ModulesPage;