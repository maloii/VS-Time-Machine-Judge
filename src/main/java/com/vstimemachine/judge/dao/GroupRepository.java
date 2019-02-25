package com.vstimemachine.judge.dao;

import com.vstimemachine.judge.model.Group;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import javax.transaction.Transactional;

@Transactional
public interface GroupRepository extends CrudRepository<Group, Long> {
    @Override
    Group save(@Param("group") Group group);

    @Override
    void deleteById(@Param("id") Long id);

    @Override
    void delete(@Param("group") Group group);
}
