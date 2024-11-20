// src/pages/Filieres/components/AddEditFiliere.jsx
import { useState, useEffect } from 'react';
import { Code, BookOpen, Building2, Users, Save, Plus, Clock, Component, SquareStack } from 'lucide-react';
import PropTypes from 'prop-types';

const AddEditGroupe = ({ group, onClose, onSave, isEditMode }) => {
  const [formData, setFormData] = useState({
    codeGroupe: '',
    niveau: '',
    intituleGroupe: '',
    filiere: '',
    modules:'',
    emploiDuTemps:'',
    liste:'',

  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (group) {
      setFormData({
        id: group.id,
        codeGroupe: group.codeGroupe || '',
        niveau: group.niveau || '',
        intituleGroupe: group.intituleGroupe || '',
        filiere: group.filiere || '',
        modules: Array.isArray(group.modules) ? group.modules.join(', ') : '',
        // modules: group.modules || '',
        emploiDuTemps: group.emploiDuTemps || '',
        liste: Array.isArray(group.liste) ? group.liste.join(', ') : '',
        // liste: group.liste || '',

      });
    }
  }, [group]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.codeGroupe.trim()) {
      newErrors.code_filiere = 'Le code est requis';
    }
    if (!formData.niveau.trim()) {
      newErrors.niveau = 'le niveau est requis';
    }
    if (!formData.intituleGroupe.trim()) {
      newErrors.intituleGroupe = "L'Intitulé Groupe est requis";
    }
    if (!formData.filiere.trim()) {
        newErrors.filiere = 'la filiere est requis';
      }
    if (!formData.emploiDuTemps.trim()) {
        newErrors.emploiDuTemps = "L'emploiDuTemps est requis";
      }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const groupeData = {
        ...formData,
        groupes: formData.groupes
          .split(',')
          .map((m) => m.trim())
          .filter(Boolean),
      };

      if (isEditMode) {
        // Ensure we keep the id for editing
        groupeData.id = group.id;
      }

      await onSave(groupeData);
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        submit: error.message || "Une erreur est survenue lors de l'enregistrement",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const formFields = [
    {
      id: 'codeGroupe',
      label: 'Code Groupe',
      icon: <Code className="w-4 h-4" />,
      placeholder: 'Entrez le code du Groupe',
    },
    {
        id: 'niveau',
        label: 'Niveau',
        icon: <SquareStack className="w-4 h-4" />,
        placeholder: 'Entrez le niveau du Groupe',
      },
    {
      id: 'intituleGroupe',
      label: 'Intitulé Groupe ',
      icon: <BookOpen className="w-4 h-4" />,
      placeholder: "Entrez l'intitulé de la filière",
    },
    {
      id: 'filiere',
      label: 'filiere',
      icon: <Building2 className="w-4 h-4" />,
      placeholder: 'Entrez Filiere',
    },
    {
      id: 'modules',
      label: 'Modules',
      icon: <Component className="w-4 h-4" />,
      placeholder: 'Entrez les modules',
    },
    {
        id: 'emploiDuTemps',
        label: 'emploi Du Temps',
        icon: <Clock className="w-4 h-4" />,
        placeholder:"Entrez l'emploiDuTemp",
      },
      {
        id: 'liste',
        label: 'liste',
        icon: <Users className="w-4 h-4" />,
        placeholder: 'Entrez la liste',
      },

  ];

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        {isEditMode ? <Save className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
        {isEditMode ? 'Modifier le Groupe' : 'Ajouter un Groupe'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {formFields.map((field) => (
          <div key={field.id} className="form-control">
            <label className="label">
              <span className="label-text flex items-center gap-2">
                {field.icon}
                {field.label}
              </span>
            </label>
            <input
              type="text"
              name={field.id}
              value={formData[field.id]}
              onChange={handleChange}
              placeholder={field.placeholder}
              className={`input input-bordered w-full ${errors[field.id] ? 'input-error' : ''}`}
              disabled={isSubmitting}
            />
            {errors[field.id] && (
              <label className="label">
                <span className="label-text-alt text-error">{errors[field.id]}</span>
              </label>
            )}
          </div>
        ))}

        {errors.submit && (
          <div className="alert alert-error">
            <span>{errors.submit}</span>
          </div>
        )}

        <div className="modal-action">
          <button type="button" onClick={onClose} className="btn btn-ghost" disabled={isSubmitting}>
            Annuler
          </button>
          <button
            type="submit"
            className={`btn btn-primary gap-2 ${isSubmitting ? 'loading' : ''}`}
            disabled={isSubmitting}
          >
            {!isSubmitting &&
              (isEditMode ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />)}
            {isEditMode ? 'Mettre à jour' : 'Ajouter'}
          </button>
        </div>
      </form>
    </div>
  );
};

AddEditGroupe.propTypes = {
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  filiere: PropTypes.shape({
    id: PropTypes.string,
    codeGroupe: PropTypes.string,
    niveau: PropTypes.string,
    intituleGroupe: PropTypes.string,
    filiere: PropTypes.string,
    modules: PropTypes.array,
    emploiDuTemps: PropTypes.string,
    liste: PropTypes.array,
  }),
};

export default AddEditGroupe;
