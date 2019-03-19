package com.vstimemachine.judge.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;

@Data
@Entity(name = "GROUPS")
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = { "id" })
public class Group {

    @Id
    @GeneratedValue
    private Long id;

    @Version
    @JsonIgnore
    private Long version;

    private LocalDateTime dateCreate = LocalDateTime.now();
    private String name;
    private Integer sort;
    private Boolean selected = false;
    private Boolean close = false;
    private Long timeSatart;
    private Long startMillisecond;

    @ManyToOne
    private Competition competition;

    @ManyToOne
    private League league;

    @ManyToOne
    private Round round;

    @ManyToMany(mappedBy = "group", cascade = CascadeType.ALL)
    @OrderBy("sort ASC")
    private Set<GroupSportsman> groupSportsmen;

    @OneToMany(mappedBy = "group", cascade = CascadeType.ALL)
    @OrderBy("millisecond ASC")
    private Set<Lap> laps;

    public Group(String name, Integer sort, Round round, Competition competition) {
        this.name = name;
        this.round = round;
        this.sort = sort;
        this.competition = competition;
    }

    public void addGroupSportsmen(GroupSportsman groupSportsman){
        if(groupSportsmen == null) groupSportsmen = new HashSet<GroupSportsman>();
        groupSportsmen.add(groupSportsman);
    }

//    @PreRemove
//    private void removeGroup() {
//        if(round != null && round.getGroups() != null) round.getGroups().remove(this);
//        if(competition != null && competition.getGroups() != null) competition.getGroups().remove(this);
//        if(league != null && league.getGroups() != null) league.getGroups().remove(this);
//        Iterator<GroupSportsman> iterator = groupSportsmen.iterator();
//        while (iterator.hasNext()) {
//            GroupSportsman groupSportsman = iterator.next();
//            groupSportsman.getSportsman().getGroupSportsmen().remove(groupSportsman);
//        }
//    }
}
