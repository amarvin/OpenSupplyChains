<?php
class Sourcemap_User_Event {

    // event scope
    const USER = 1;
    const GROUP = 2;
    const EVERYBODY = 4;

    const SIGNEDUP = 1;
    const CREATEDSC = 2;
    const UPDATEDSC = 4;
    const FAVEDSC = 8;
    const COMMENTEDSC = 16;
    const SENTMSG = 32;

    protected static $_tags = array(
        'signedup' => 1, 'createdsc' => 2,
        'updatedsc' => 4, 'favedsc' => 8,
        'commentedsc' => 16, 'sentmsg' => 32
    );

    public static function factory($type) {
        $args = func_get_args();
        array_shift($args);
        $type = self::tag($type);
        $cls = __CLASS__.'_'.str_replace(' ', '_', ucwords(str_replace('_', ' ', $type)));
        try {
            $rc = new ReflectionClass($cls);
            $evt = $rc->newInstanceArgs($args);
        } catch(Exception $e) {
            $evt = false;
        }
        return $evt;
    }

    public static function tag($flag) {
        $flag = (int)$flag;
        $tags = array_flip(self::$_tags);
        $tag = false;
        if(isset($tags[$flag])) $tag = $tags[$flag];
        return $tag;
    }

    public static function tags($flags) {
        $tags = array();
        foreach($self::$_tags as $tag => $flag) {
            if($flags & $flag) $tags[] = $tag;
        }
        return $tags;
    }

    public static function flag($tag) {
        $flag = 0;
        if(isset(self::$_tags[$tag])) $flag = self::$_tags[$tag];
        return $flag;
    }

    public static function flags() { // tag, tag, ...
        $tags = func_get_args();
        $flags = 0;
        for($i=0; $i<$tags; $i++) {
            $flags |= self::flag($tag);
        }
        return $flags;
    }

    public function trigger() {
        if(!($tag = $this->_tag)) return false;
        $recipients = $this->get_recipients(); // array($scope_id[, $scope=self::USER])
        $triggered = 0;
        if($recipients) {
            foreach($recipients as $i => $recipient) {
                if(is_array($recipient)) {
                    if(count($recipient) == 2) {
                        list($scope_id, $scope) = $recipient;
                    } else continue;
                } else {
                    $scope_id = $recipient;
                    $scope = self::USER;
                }
                if($this->publish_to($scope_id, $scope)) $triggered++;
            }
        }
        return $triggered;
    }

    protected function get_recipients() {
        return array();
    }

    protected function publish_to($scope_id, $scope=self::USER) {
        $evt = ORM::factory('user_event');
        $evt->event = self::flag($this->_tag);
        $evt->timestamp = $this->timestamp;
        $evt->scope_id = $scope_id;
        $evt->scope = $scope;
        $evt->data = $this->get_serialized_data();
        print_r($evt);
        return $evt->save();
    }

    protected function get_serialized_data() {
        return json_encode($this->get_data());
    }
}
