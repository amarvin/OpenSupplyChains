<?php
class Sourcemap_Form_Field {

    const SELECT = 'select';
    const INPUT = 'input';
    const TEXT = 'text';
    const PASSWORD = 'password';
    const SUBMIT = 'submit';
    const TEXTAREA = 'textarea';
    const CHECKBOX = 'checkbox';
    const HIDDEN = 'hidden';

    protected $_name = 'field';

    protected $_label = false;
    protected $_info = false;
    protected $_type = 'text';
    protected $_value = null;
    protected $_weight = 0;
    protected $_template = 'form/field';

    protected $_form = null;

    protected $_errors = array();
    protected $_rules = array();

    protected $_css_class = false;

    public function __construct($name=null, $value=null) {
        $this->_name = $name;
        $this->_value = $value;
    }

    public function __toString() {
        $s = '';
        if(Sourcemap_Form::$use_templates) {
            try {
                $s = (string)View::factory($this->_template, array('field' => $this));
            } catch(Exception $e) {
                $s = $e->getMessage();
            }
        } else {
            if($this->_label)
                $s = $this->_makeLabel();

            if($this->errors()) $this->add_class('error');

            $s .= $this->_makeInput();

            if($err = $this->errors()) $s .= "\n".'<div class="error preserve">'.$err.'</div>';

            if($this->errors()) $this->remove_class('error');

            $s .= "\n<div class=\"clear\"></div>\n";
        }
        return $s;
    }

    public function form($f=false) {
        if($f && $f instanceof Sourcemap_Form) {
            $this->_form = $f;
        }
        return $this->_form;
    }

    /*protected function rule($r, $args) {
        $this->form()->rule($this->_name, $r, $args);
    }*/
    
    protected function _makeLabel() {
        return Form::label($this->_name, $this->label().':');
    }

    protected function _makeInput() {
        return Form::input($this->_name, $this->_value, array(
            'class' => $this->css_class(),
            'type' => $this->_type
        ));
    }

    public static function from_array($nm, $arr) {
        $ftype = isset($arr['type']) ? $arr['type'] : null;
        $new_field = Sourcemap_Form_Field::factory($ftype);
        $new_field->name($nm);
        if(isset($arr['label'])) $new_field->label($arr['label']);
        switch($new_field->field_type()) {
            case self::SELECT:
                if(isset($arr['options']) && is_array($arr['options'])) {
                    foreach($arr['options'] as $i => $opt) {
                        call_user_func_array(array($new_field, 'option'), $opt);
                    }
                }
            default:
                if(isset($arr['default'])) {
                    $new_field->value($arr['default']);
                }
                break;
        }
        return $new_field;
    }

    public static function factory($t=null) {
        $instance = false;
        switch($t) {
            case self::CHECKBOX:
                $cls = 'Sourcemap_Form_Field_Checkbox';
                break;
            case self::SELECT:
                $cls = 'Sourcemap_Form_Field_Select';
                break;
            case self::PASSWORD:
                $cls = 'Sourcemap_Form_Field_Password';
                break;
            case self::SUBMIT:
                $cls = 'Sourcemap_Form_Field_Submit';
                break;
            case self::HIDDEN:
                $cls = 'Sourcemap_Form_Field_Hidden';
                break;
            case self::TEXT:
            case self::INPUT:
            default:
                $cls = 'Sourcemap_Form_Field';
                break;
        }
        if($cls) {
            $rc = new ReflectionClass($cls);
            $instance = $rc->newInstance();
        }
        return $instance;
    }

    public function field_type() {
        return $this->_type;
    }

    protected function _accessor($p, $v=null) {
        if($v !== null) $this->$p = $v;
        else return $this->$p;
        return $this;
    }

    public function name($nm=null) {
        return $this->_accessor('_name', $nm);
    }

    public function info($info=null) {
        return $this->_accessor('_info', $info);
    }

    public function label($label=null) {
        return $this->_accessor('_label', $label);
    }

    public function value($v=null, $force=false) {
        if($force) {
            $this->_value = $v;
            return $this;
        } else return $this->_accessor('_value', $v);
    }

    public function weight($wt=null) {
        return $this->_accessor('_weight', $wt);
    }

    public function has_class($cls) {
        return is_array($this->_css_class) && in_array($cls, $this->_css_class);
    }

    public function add_class($cls) {
        if(!is_array($this->_css_class))
            $this->_css_class = array();
        if(!$this->has_class($cls))
            $this->_css_class[] = $cls;
        return $this;
    }

    public function css_class() {
        if(!is_array($this->_css_class))
            return null;
        return join(' ', $this->_css_class);
    }

    public function remove_class($cls) {
        if($this->has_class($cls)) {
            $k = array_search($cls, $this->_css_class, true);
            if($k !== false) {
                array_splice($this->_css_class, $k, 1); 
            }
        }
        return $this;
    }

    public function error($e) {
        if(!is_array($this->_errors))
            $this->_errors = array();
        $this->_errors[] = $e;
        return $this;
    }

    public function errors($es=null) {
        if($es !== null) {
            $this->_errors = $es;
            return $this;
        } else return $this->_errors;
    }

    public function rules($arr=null) {
        if($arr !== null && is_array($arr)) {
            $this->_rules = $arr;
            return $this;
        }
        return $this->_rules;
    }

    public function rule($r, $args=array()) {
        if(!$this->_rules) $this->_rules = array();
        $this->_rules[] = array($r, $args);
    }
}
